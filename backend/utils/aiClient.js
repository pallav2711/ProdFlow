const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const AI_REQUEST_TIMEOUT_MS = parsePositiveInt(process.env.AI_REQUEST_TIMEOUT_MS, 4000);
const AI_MAX_RETRIES = parsePositiveInt(process.env.AI_MAX_RETRIES, 1);
const AI_RETRY_BASE_DELAY_MS = parsePositiveInt(process.env.AI_RETRY_BASE_DELAY_MS, 300);

const isRetryableError = (error) => {
  if (!error) return false;
  if (error.code === 'ECONNABORTED') return true;
  if (error.code === 'ECONNRESET') return true;
  if (error.code === 'ENOTFOUND') return true;
  if (error.code === 'ECONNREFUSED') return true;
  if (error.response && error.response.status >= 500) return true;
  return false;
};

const buildPredictionPayload = ({ totalTasks, duration, teamSize, totalEffort }) => ({
  total_tasks: totalTasks,
  sprint_duration: duration,
  team_size: teamSize,
  estimated_effort: totalEffort
});

const fetchSprintPrediction = async ({ totalTasks, duration, teamSize, totalEffort, requestId }) => {
  if (!process.env.AI_SERVICE_URL) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const payload = buildPredictionPayload({ totalTasks, duration, teamSize, totalEffort });
  const url = `${process.env.AI_SERVICE_URL}/ai/sprint-success`;
  let lastError;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await axios.post(url, payload, {
        timeout: AI_REQUEST_TIMEOUT_MS,
        headers: {
          ...(requestId ? { 'X-Request-ID': requestId } : {})
        }
      });

      return {
        successProbability: response?.data?.success_probability
      };
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt >= AI_MAX_RETRIES) {
        break;
      }

      const backoff = AI_RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }

  throw lastError;
};

module.exports = {
  fetchSprintPrediction
};
