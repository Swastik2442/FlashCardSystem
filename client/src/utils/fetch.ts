/**
 * Function to create a fetch with credentials along with the security headers
 * @param url URL to be fetched
 * @param method HTTP method to be used
 * @param body Body of the request
 * @param csrfToken CSRF Token to be sent in the headers
 * @returns `fetch` function loaded with the information
*/
export function fetchWithCredentials(url: string | URL | globalThis.Request, method: string, body?: BodyInit | null, csrfToken?: string) {
  const authHeaders = new Headers();
  authHeaders.append("Access-Control-Allow-Origin", import.meta.env.VITE_SERVER_HOST);
  authHeaders.append("Content-Type", "application/json");
  if (csrfToken) authHeaders.append("x-csrf-token", csrfToken);

  return fetch(url, {
    method: method,
    headers: authHeaders,
    credentials: "include",
    body: body,
  });
}

export default fetchWithCredentials;
