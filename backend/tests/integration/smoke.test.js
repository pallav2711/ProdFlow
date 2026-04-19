/* eslint-disable no-console */
const BASE_URL = process.env.TEST_API_BASE_URL || 'http://localhost:5000/api';
const TEST_MODE = (process.env.TEST_SMOKE_MODE || 'full').toLowerCase();
const FAST_MODE = TEST_MODE === 'fast';

const uniqueEmail = (label) => `${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;

const expectStatus = (response, expected, context, data) => {
  if (response.status === expected) return;
  throw new Error(
    `${context} expected ${expected}, got ${response.status}. Body: ${JSON.stringify(data)}`
  );
};

const expectErrorCode = (data, expectedCode, context) => {
  if (data?.code === expectedCode) return;
  throw new Error(
    `${context} expected code ${expectedCode}, got ${data?.code}. Body: ${JSON.stringify(data)}`
  );
};

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  return { response, data };
};

const registerAndLogin = async ({ name, role }) => {
  const email = uniqueEmail(role.toLowerCase().replace(/\s+/g, '-'));
  const password = 'Testpass123';

  {
    const { response } = await request('/auth/register', {
      method: 'POST',
      body: { name, email, password, role }
    });
    expectStatus(response, 201, `register ${role}`);
  }

  const { response, data } = await request('/auth/login', {
    method: 'POST',
    body: { email, password, rememberMe: false }
  });
  expectStatus(response, 200, `login ${role}`, data);

  if (!data?.accessToken) {
    throw new Error(`login ${role} missing accessToken`);
  }

  return { email, token: data.accessToken };
};

const getPendingInvitationForUser = async (token, productId) => {
  const { response, data } = await request('/teams/invitations?page=1&limit=50', { token });
  expectStatus(response, 200, 'get pending invitations', data);

  const invitations = data?.invitations || [];
  return invitations.find((inv) => inv.product?._id === productId || inv.product === productId);
};

const main = async () => {
  console.log(`Running integration smoke test against ${BASE_URL} in ${TEST_MODE} mode`);

  // Roles for workflow
  const pm = await registerAndLogin({ name: 'PM Smoke', role: 'Product Manager' });
  const lead = await registerAndLogin({ name: 'Lead Smoke', role: 'Team Lead' });
  const dev = await registerAndLogin({ name: 'Dev Smoke', role: 'Developer' });

  // Negative role check: developer cannot create product.
  {
    const { response, data } = await request('/products', {
      method: 'POST',
      token: dev.token,
      body: {
        name: `Unauthorized Product ${Date.now()}`,
        vision: 'Should be forbidden',
        description: 'negative role test'
      }
    });
    expectStatus(response, 403, 'developer create product forbidden', data);
    expectErrorCode(data, 'INSUFFICIENT_ROLE', 'developer create product forbidden');
  }

  // PM creates product
  const productPayload = {
    name: `Smoke Product ${Date.now()}`,
    vision: 'Validate critical path integration with lightweight smoke tests.',
    description: 'Temporary integration smoke product'
  };
  const { response: productRes, data: productData } = await request('/products', {
    method: 'POST',
    token: pm.token,
    body: productPayload
  });
  expectStatus(productRes, 201, 'create product', productData);
  const productId = productData?.product?._id;
  if (!productId) throw new Error('create product missing product id');

  // Negative role check: developer cannot invite members.
  {
    const { response, data } = await request('/teams/invite', {
      method: 'POST',
      token: dev.token,
      body: {
        productId,
        userEmail: lead.email,
        role: 'Developer',
        specialization: 'Frontend'
      }
    });
    expectStatus(response, 403, 'developer invite forbidden', data);
    expectErrorCode(data, 'INSUFFICIENT_ROLE', 'developer invite forbidden');
  }

  // PM invites lead and developer
  for (const invite of [
    { email: lead.email, role: 'Team Lead', specialization: 'Backend' },
    { email: dev.email, role: 'Developer', specialization: 'Frontend' }
  ]) {
    const { response } = await request('/teams/invite', {
      method: 'POST',
      token: pm.token,
      body: {
        productId,
        userEmail: invite.email,
        role: invite.role,
        specialization: invite.specialization
      }
    });
    expectStatus(response, 201, `invite ${invite.role}`);
  }

  // Accept invitations
  const leadInvitation = await getPendingInvitationForUser(lead.token, productId);
  const devInvitation = await getPendingInvitationForUser(dev.token, productId);
  if (!leadInvitation?._id) throw new Error('lead invitation not found');
  if (!devInvitation?._id) throw new Error('dev invitation not found');

  {
    const { response, data } = await request(`/teams/invitations/${leadInvitation._id}/accept`, {
      method: 'PUT',
      token: lead.token
    });
    expectStatus(response, 200, 'accept lead invitation', data);
  }
  {
    const { response, data } = await request(`/teams/invitations/${devInvitation._id}/accept`, {
      method: 'PUT',
      token: pm.token
    });
    expectStatus(response, 403, 'pm accept developer invitation forbidden', data);
    expectErrorCode(data, 'INVITATION_ACTION_FORBIDDEN', 'pm accept invitation forbidden');
  }
  {
    const { response, data } = await request(`/teams/invitations/${devInvitation._id}/accept`, {
      method: 'PUT',
      token: dev.token
    });
    expectStatus(response, 200, 'accept developer invitation', data);
  }

  // PM adds feature
  const featurePayload = {
    name: `Smoke Feature ${Date.now()}`,
    description: 'Feature for sprint/task lifecycle smoke testing',
    priority: 'High',
    businessValue: 8,
    estimatedEffort: 12
  };
  const { response: featureRes, data: featureData } = await request(`/products/${productId}/features`, {
    method: 'POST',
    token: pm.token,
    body: featurePayload
  });
  expectStatus(featureRes, 201, 'create feature', featureData);
  const featureId = featureData?.feature?._id;
  if (!featureId) throw new Error('create feature missing feature id');

  if (FAST_MODE) {
    // Fast mode: short contract checks only.
    for (const route of ['/products', '/sprints', '/sprints/my-tasks', '/teams/invitations']) {
      const { response, data } = await request(`${route}?page=1&limit=5`, { token: pm.token });
      expectStatus(response, 200, `pagination check ${route}`, data);
      const hasPagination = ['totalCount', 'page', 'limit', 'totalPages'].every((key) => key in data);
      if (!hasPagination) {
        throw new Error(`pagination metadata missing on ${route}`);
      }
    }

    console.log('PASS: fast smoke workflow');
    return;
  }

  // Lead creates sprint
  const sprintPayload = {
    name: `Smoke Sprint ${Date.now()}`,
    product: productId,
    duration: 14,
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    teamSize: 3,
    features: [featureId]
  };
  const { response: sprintRes, data: sprintData } = await request('/sprints', {
    method: 'POST',
    token: lead.token,
    body: sprintPayload
  });
  expectStatus(sprintRes, 201, 'create sprint', sprintData);
  const sprintId = sprintData?.sprint?._id;
  if (!sprintId) throw new Error('create sprint missing sprint id');

  // Lead adds task assigned to developer
  const taskPayload = {
    feature: featureId,
    title: `Smoke Task ${Date.now()}`,
    description: 'Task for review workflow smoke testing',
    assignedTo: devInvitation.user?._id || undefined,
    workType: 'Frontend',
    estimatedHours: 6
  };
  const { response: taskRes, data: taskData } = await request(`/sprints/${sprintId}/tasks`, {
    method: 'POST',
    token: lead.token,
    body: taskPayload
  });
  expectStatus(taskRes, 201, 'create task', taskData);
  const taskId = taskData?.task?._id;
  if (!taskId) throw new Error('create task missing task id');

  // Developer submits for review
  {
    const { response, data } = await request(`/sprints/tasks/${taskId}`, {
      method: 'PUT',
      token: dev.token,
      body: { status: 'Pending Review' }
    });
    expectStatus(response, 200, 'developer submit for review', data);
    if (data?.task?.status !== 'Pending Review') {
      throw new Error(`expected Pending Review, got ${data?.task?.status}`);
    }
  }

  // Negative workflow check: developer cannot self-approve task completion.
  {
    const { response, data } = await request(`/sprints/tasks/${taskId}`, {
      method: 'PUT',
      token: dev.token,
      body: { status: 'Completed' }
    });
    expectStatus(response, 403, 'developer complete task forbidden', data);
    expectErrorCode(data, 'INVALID_STATUS_TRANSITION', 'developer complete task forbidden');
  }

  // Lead rejects task
  {
    const { response, data } = await request(`/sprints/tasks/${taskId}/reject`, {
      method: 'PUT',
      token: lead.token,
      body: { reviewNotes: 'Needs polish before approval' }
    });
    expectStatus(response, 200, 'lead rejects task', data);
    if (data?.task?.status !== 'In Progress') {
      throw new Error(`expected In Progress after reject, got ${data?.task?.status}`);
    }
  }

  // Developer resubmits and lead approves
  {
    const { response } = await request(`/sprints/tasks/${taskId}`, {
      method: 'PUT',
      token: dev.token,
      body: { status: 'Pending Review' }
    });
    expectStatus(response, 200, 'developer resubmit');
  }
  {
    const { response, data } = await request(`/sprints/tasks/${taskId}`, {
      method: 'PUT',
      token: lead.token,
      body: { status: 'Completed', reviewNotes: 'Approved in smoke test' }
    });
    expectStatus(response, 200, 'lead approve task', data);
    if (data?.task?.status !== 'Completed') {
      throw new Error(`expected Completed after approval, got ${data?.task?.status}`);
    }
  }

  // Pagination contract checks for protected list routes
  for (const route of ['/products', '/sprints', '/sprints/my-tasks', '/teams/invitations']) {
    const { response, data } = await request(`${route}?page=1&limit=5`, { token: pm.token });
    expectStatus(response, 200, `pagination check ${route}`, data);
    const hasPagination = ['totalCount', 'page', 'limit', 'totalPages'].every((key) => key in data);
    if (!hasPagination) {
      throw new Error(`pagination metadata missing on ${route}`);
    }
  }

  console.log('PASS: critical integration smoke workflow');
};

main().catch((error) => {
  console.error('FAIL:', error.message);
  process.exit(1);
});
