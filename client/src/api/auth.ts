import fetchWithCredentials from "@/utils/fetch";
import type { TLoginFormSchema, TRegisterFormSchema, TUserDetailsFormSchema, TChangeUsernameFormSchema, TChangeEmailFormSchema, TChangePasswordFormSchema } from "@/types/forms";

/**
 * Makes a GET request to get the CSRF Token
 * @returns CSRF Token
 */
export async function getCSRFToken() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/csrf-token`,
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
 * Makes a POST request to register a new user
 * @param data information about the user
 * @returns Message from the Server
 */
export async function registerUser(data: TRegisterFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/register`,
    "post",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Register");
  });

  const registerData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(registerData.message || "Failed to Register");

  return registerData.message;
}

/**
 * Makes a POST request to login a user
 * @param data information about the user
 * @returns Username of the logged in user
 */
export async function loginUser(data: TLoginFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/login`,
    "post",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Login");
  });

  const loginData = await res.json() as ICustomResponse<string>;
  if (!res?.ok)
    throw new Error(loginData.message || "Failed to Login");

  return loginData.data;
}

/**
 * Makes a GET request to logout the user
 * @returns Message from the Server
 */
export async function logoutUser() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/logout`, "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Logout");
  });

  const data = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(data.message || "Failed to Logout");

  return data.message;
}

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
    await logoutUser();
  if (!res.ok)
    throw new Error(data.message || "Failed to Refresh Tokens");

  return data.data;
}

/**
 * Makes a PATCH request to update the user details
 * @param data information about the user
 * @returns Message from the Server
 */
export async function updateUser(data: TUserDetailsFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/user`,
    "PATCH",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Edit User details");
  });

  const userData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(userData.message || "Failed to Edit User details");

  return userData.message;
}

/**
 * Makes a PATCH request to change the username of the user
 * @param data information about the user
 * @returns Username of the User
 */
export async function changeUsername(data: TChangeUsernameFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/edit/username`,
    "PATCH",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Change Username");
  });

  const userData = await res.json() as ICustomResponse<string>;
  if (!res?.ok)
    throw new Error(userData.message || "Failed to Change Username");

  return userData.data;
}

/**
 * Makes a PATCH request to change the email of the user
 * @param data information about the user
 * @returns Message from the Server
 */
export async function changeEmail(data: TChangeEmailFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/edit/email`,
    "PATCH",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Change Email");
  });

  const userData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(userData.message || "Failed to Change Email");

  return userData.message;
}

/**
 * Makes a PATCH request to change the password of the user
 * @param data information about the passwords
 * @returns Message from the Server
 */
export async function changePassword(data: TChangePasswordFormSchema) {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/edit/password`,
    "PATCH",
    JSON.stringify(data),
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Change Password");
  });

  const userData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(userData.message || "Failed to Change Password");

  return userData.message;
}

/**
 * Makes a DELETE request to delete the user
 * @returns Message from the Server
 */
export async function deleteUser() {
  const csrfToken = await getCSRFToken();
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/delete`,
    "delete",
    null,
    csrfToken
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Delete User");
  });

  const data = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(data.message || "Failed to Delete User");

  return data.message;
}
