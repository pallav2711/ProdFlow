export const normalizeApiError = (error) => {
  const response = error?.response;
  const data = response?.data;
  const status = response?.status || null;
  const code = data?.code || error?.code || 'UNKNOWN_ERROR';
  const requestId =
    data?.requestId ||
    response?.headers?.['x-request-id'] ||
    error?.config?.headers?.['X-Request-ID'] ||
    null;
  const details = data?.details || null;

  let message = 'Something went wrong. Please try again.';

  if (data?.message) {
    message = data.message;
  } else if (error?.code === 'ECONNABORTED') {
    message = 'Request timed out. Please check your connection and try again.';
  } else if (error?.code === 'ERR_NETWORK') {
    message = 'Network error. Please check your internet connection.';
  } else if (status === 401) {
    message = 'Your session has expired. Please log in again.';
  } else if (status === 403) {
    message = 'You do not have permission to perform this action.';
  } else if (status === 404) {
    message = 'The requested resource was not found.';
  } else if (status === 429) {
    message = 'Too many requests. Please wait and try again.';
  } else if (status >= 500) {
    message = 'Server error. Please try again in a moment.';
  } else if (error?.message) {
    message = error.message;
  }

  return {
    status,
    code,
    message,
    requestId,
    details,
    isNetworkError: !response,
    isTimeout: error?.code === 'ECONNABORTED'
  };
};

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong.') => {
  const normalized = normalizeApiError(error);
  return normalized.message || fallbackMessage;
};
