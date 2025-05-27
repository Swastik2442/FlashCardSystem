import fetchWithCredentials from "@/utils/fetch";

/**
 * Makes a GET request to get the CSRF Token
 * @returns CSRF Token
 */
export async function getCSRFToken() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/csrf-token`,
    "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to get CSRF Token");
  });

  const data = await res.json() as ICustomResponse<string>;
  if (!res?.ok)
    throw new Error(data.message || "Failed to get CSRF Token");

  return data.data;
}

/**
 * Makes a request to the Backend Server URL with the given arguments
 * @param url Relative URL to make the request to
 * @param method Method of the request
 * @param data Data to be sent in the request
 * @param errMsg Error message to be thrown if no error message is received from the server
 * @param csrf Whether to enable CSRF Protection or not
 * @returns Data from the Server
 */
export async function makeRequest<T>(
    url: string,
    method: "get" | "post" | "PATCH" | "delete",
    data?: unknown,
    errMsg?: string,
    csrf = true
) {
  url = import.meta.env.VITE_SERVER_HOST + url;
  errMsg = errMsg ?? "Failed to make the request";

  let res: Response;
  if (method == "get") {
    res = await fetchWithCredentials(
      url, method,
    ).catch((err: Error) => {
      throw new Error(err?.message ?? errMsg);
    });
  } else {
    res = await fetchWithCredentials(
      url,
      method,
      JSON.stringify(data),
      csrf ? await getCSRFToken() : undefined
    ).catch((err: Error) => {
      throw new Error(err?.message ?? errMsg);
    });
  }

  const resData = await res.json() as ICustomResponse<T>;
  if (!res?.ok)
    throw new Error(resData.message ?? errMsg);

  return resData;
}

export default makeRequest;
