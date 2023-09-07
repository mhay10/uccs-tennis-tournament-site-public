function authModule() {
  // const fetch = window.fetch;

  const origins = ['http://localhost:5173', 'https://uccs-tennis-tournament-site.onrender.com'];
  let token = '';

  function setToken(value: string) {
    token = value;
  }

  function fetchResource(resource: string, options?: RequestInit) {
    const req = new Request(resource, options);
    const destOrigin = new URL(req.url).origin;
    if (token && origins.includes(destOrigin)) {
      req.headers.set('Authorization', `${token}`);
    }
    return fetch(req);
  }

  return {
    setToken,
    fetch: fetchResource
  };
}

export const auth = authModule();
