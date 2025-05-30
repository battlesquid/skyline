import { client } from "./client";
import { UserQuery } from "./query";

const TOKEN_KEY = "token";
const LOGIN_KEY = "login";

export interface UserProfile {
    name: string | null;
    avatarUrl?: string;
    login: string;
}

export const fetchProfile = async (): Promise<UserProfile | null> => {
    const result = await client.query(UserQuery, {}).toPromise();
    if (!result.data) {
        return null;
    }
    return {
        name: result.data.viewer.name,
        avatarUrl: result.data.viewer.avatarUrl as string, // TODO: make sure default avatars aren't affected by this
        login: result.data.viewer.login
    }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

export const deleteToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

export const resolveToken = async (): Promise<string | null> => {
  const token = getToken();
  if (token !== null) {
    return token;
  }

  const code = new URL(location.href).searchParams.get("code");
  if (code === null) {
    return null;
  }

  const path =
    location.pathname +
    location.search.replace(/\bcode=\w+/, "").replace(/\?$/, "");
  history.pushState({}, "", path);

  const response = await fetch(import.meta.env.PUBLIC_WORKER_URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ code })
  });

  const result = await response.json();

  if (result.error) {
    return null;
  }

  setToken(result.token);

  return result.token;
}

export const logout = () => {
    localStorage.clear();
    location.reload();
}

export const loadLogin = async () => {
    if (localStorage.getItem(LOGIN_KEY) === null) {
        const profile = await fetchProfile();
        if (profile === null) {
            return;
        }
        localStorage.setItem(LOGIN_KEY, profile.login);
    }
}

export const getUsername = () => localStorage.getItem(LOGIN_KEY)
