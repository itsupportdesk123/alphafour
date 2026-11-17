/**
 * Client for the Alphafour Infrastructure Pvt Ltd API (Node.js mail & feedback service).
 * In development Vite proxies /api to the server; in production set VITE_API_URL.
 */
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fieldErrors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('We couldn’t reach our server. Please check your connection and try again.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON response (e.g. proxy error page) */
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message || 'Something went wrong. Please try again in a moment.', {
      status: response.status,
      code: payload?.code ?? 'UNKNOWN_ERROR',
      fieldErrors: payload?.errors ?? [],
    });
  }
  return payload;
}

export const api = {
  sendEnquiry: (data) => post('/enquiries', data),
  requestSiteVisit: (data) => post('/enquiries/site-visit', data),
  requestCallback: (data) => post('/enquiries/callback', data),
  sendFeedback: (data) => post('/feedback', data),
  subscribe: (data) => post('/newsletter/subscribe', data),
};
