import { makeRequest } from "@/api/common";
import fetchWithCredentials from "@/utils/fetch";
import type { TLoginFormSchema, TRegisterFormSchema, TChangeUsernameFormSchema, TChangeEmailFormSchema, TChangePasswordFormSchema } from "@/types/forms";

/**
 * Makes a GET request to refresh the user tokens
 * @returns Username of the logged in user
 */
export async function refreshTokens() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/refresh-token`, "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Refresh Tokens");
  });

  const data = await res.json() as ICustomResponse<string>;
  if (res.status == 400 || res.status == 401)
    return null;
  if (!res.ok)
    throw new Error(data.message || "Failed to Refresh Tokens");

  return data.data;
}

/**
 * Makes a POST request to register a new user
 * @param data information about the user
 * @returns Message from the Server
 */
export async function registerUser(data: TRegisterFormSchema) {
  const response = await makeRequest<undefined>(
    "/auth/register",
    "post",
    data,
    "Failed to Register"
  );
  return response.message;
}

/**
 * Makes a POST request to login a user
 * @param data information about the user
 * @returns Username of the logged in user
 */
export async function loginUser(data: TLoginFormSchema) {
  const response = await makeRequest<string>(
    "/auth/login",
    "post",
    data,
    "Failed to Login"
  );
  return response.data;
}

/**
 * Makes a GET request to logout the user
 * @returns Message from the Server
 */
export async function logoutUser() {
  const response = await makeRequest<undefined>(
    "/auth/logout",
    "get",
    null,
    "Failed to Logout"
  );
  return response.message;
}

/**
 * Makes a PATCH request to change the username of the user
 * @param data information about the user
 * @returns Username of the User
 */
export async function changeUsername(data: TChangeUsernameFormSchema) {
  const response = await makeRequest<string>(
    "/auth/edit/username",
    "PATCH",
    data,
    "Failed to Change Username"
  );
  return response.data;
}

/**
 * Makes a PATCH request to change the email of the user
 * @param data information about the user
 * @returns Message from the Server
 */
export async function changeEmail(data: TChangeEmailFormSchema) {
  const response = await makeRequest<undefined>(
    "/auth/edit/email",
    "PATCH",
    data,
    "Failed to Change Email"
  );
  return response.message;
}

/**
 * Makes a PATCH request to change the password of the user
 * @param data information about the passwords
 * @returns Message from the Server
 */
export async function changePassword(data: TChangePasswordFormSchema) {
  const response = await makeRequest<undefined>(
    "/auth/edit/password",
    "PATCH",
    data,
    "Failed to Change Password"
  );
  return response.message;
}

/**
 * Makes a DELETE request to delete the user
 * @returns Message from the Server
 */
export async function deleteUser() {
  const response = await makeRequest<undefined>(
    "/auth/delete",
    "delete",
    null,
    "Failed to Delete User"
  );
  return response.message;
}
