const authHeaders = new Headers();
authHeaders.append("Access-Control-Allow-Origin", "http://localhost:2442");
authHeaders.append("Content-Type", "application/json");

export function fetchWithCredentials(url: string | URL | globalThis.Request, method: string, body?: BodyInit | null) {
  return fetch(url, {
    method: method,
    headers: authHeaders,
    credentials: "include",
    body: body,
  });
}

export default fetchWithCredentials;
