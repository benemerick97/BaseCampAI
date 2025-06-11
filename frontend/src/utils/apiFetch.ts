// src/utils/apiFetch.ts
export const apiFetch = async (
  url: string,
  userOrgId: string,
  options: RequestInit = {}
) => {
  const headers = {
    ...(options.headers || {}),
    "x-org-id": userOrgId,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
