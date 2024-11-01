import fetchWithCredentials from "@/utils/fetch";
import type { TLoginFormSchema, TRegisterFormSchema } from "@/types/forms";

export async function registerUser(data: TRegisterFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/register`,
    "post",
    JSON.stringify(data)
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Register");
  });

  const registerData = await res.json() as ICustomResponse<undefined>;
  if (!res?.ok)
    throw new Error(registerData.message || "Failed to Register");

  return registerData.message;
}

export async function loginUser(data: TLoginFormSchema) {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/login`,
    "post",
    JSON.stringify(data)
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Login");
  });

  const loginData = await res.json() as ICustomResponse<string>;
  if (!res?.ok)
    throw new Error(loginData.message || "Failed to Login");

  return loginData.data;
}

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

export async function refreshTokens() {
  const res = await fetchWithCredentials(
    `${import.meta.env.VITE_SERVER_HOST}/auth/refresh-token`, "get"
  ).catch((err: Error) => {
    throw new Error(err?.message || "Failed to Refresh Tokens");
  });

  const data = await res.json() as ICustomResponse<string>;
  if (!res?.ok)
    throw new Error(data.message || "Failed to Refresh Tokens");
  
  return data.data;
}
