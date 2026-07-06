// Global loading tracker for API requests.
// Keeps a count of in-flight requests and notifies subscribers whenever the
// loading state changes, so a single BR logo loader can be shown app-wide
// while we wait for any API response.

let activeRequests = 0;
const listeners = new Set();

const notify = () => {
  const isLoading = activeRequests > 0;
  listeners.forEach((listener) => listener(isLoading));
};

export const startLoading = () => {
  activeRequests += 1;
  notify();
};

export const stopLoading = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
};

export const subscribeLoading = (listener) => {
  listeners.add(listener);
  listener(activeRequests > 0);
  return () => {
    listeners.delete(listener);
  };
};

// Attaches request/response interceptors to an axios instance so that every
// request bumps the global loader and every response (success or error) clears
// it again.
export const attachLoaderInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      startLoading();
      return config;
    },
    (error) => {
      stopLoading();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      stopLoading();
      return response;
    },
    (error) => {
      stopLoading();
      return Promise.reject(error);
    }
  );

  return instance;
};
