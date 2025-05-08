export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {},
    auth: { accessToken: string | null; refreshAuthToken: () => Promise<string>; logout: () => Promise<void> }
  ) => {
    if (!auth.accessToken) {
      throw new Error('No access token available');
    }
  
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${auth.accessToken}`,
    };
  
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      try {
        const newToken = await auth.refreshAuthToken();
        const newResponse = await fetch(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        });
        return newResponse;
      } catch (err) {
        await auth.logout();
        throw new Error('Session expired');
      }
    }
    return response;
  };