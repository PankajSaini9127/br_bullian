// Global loading tracker for API requests.
// Keeps a count of in-flight read vs write requests and notifies subscribers.
// Read (GET) requests use a sleek top loading progress bar.
// Write (POST, PUT, DELETE) requests display a blocking overlay to prevent double submission.

let activeReads = 0;
let activeWrites = 0;
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener({
    isReading: activeReads > 0,
    isWriting: activeWrites > 0
  }));
};

export const startLoading = (method = 'get') => {
  if (method.toLowerCase() === 'get') {
    activeReads += 1;
  } else {
    activeWrites += 1;
  }
  notify();
};

export const stopLoading = (method = 'get') => {
  if (method.toLowerCase() === 'get') {
    activeReads = Math.max(0, activeReads - 1);
  } else {
    activeWrites = Math.max(0, activeWrites - 1);
  }
  notify();
};

export const subscribeLoading = (listener) => {
  listeners.add(listener);
  listener({
    isReading: activeReads > 0,
    isWriting: activeWrites > 0
  });
  return () => {
    listeners.delete(listener);
  };
};

// Attaches request/response interceptors to an axios instance so that every
// request bumps the global loader and every response (success or error) clears it.
export const attachLoaderInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      startLoading(config.method || 'get');
      return config;
    },
    (error) => {
      stopLoading(error.config?.method || 'get');
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      stopLoading(response.config?.method || 'get');
      return response;
    },
    (error) => {
      stopLoading(error.config?.method || 'get');
      return Promise.reject(error);
    }
  );

  return instance;
};
