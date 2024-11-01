const authHeaders = new Headers();
authHeaders.append("Access-Control-Allow-Origin", import.meta.env.VITE_SERVER_HOST);
authHeaders.append("Content-Type", "application/json");

/**
 * Function to create a fetch with credentials along with the security headers
 * @param url URL to be fetched
 * @param method HTTP method to be used
 * @param body Body of the request
 * @returns `fetch` function loaded with the information
 */
export function fetchWithCredentials(url: string | URL | globalThis.Request, method: string, body?: BodyInit | null) {
  return fetch(url, {
    method: method,
    headers: authHeaders,
    credentials: "include",
    body: body,
  });
}

export default fetchWithCredentials;
