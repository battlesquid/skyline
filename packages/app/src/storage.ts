import { FontData } from "@react-three/drei";
import { FontMap } from "./stores";
import { loadProfile } from "./api/loadProfile";

export enum StorageKeys {
    TOKEN = "token",
    FONTS = "fonts",
    USERNAME = "username"
}

export const getToken = () => localStorage.getItem(StorageKeys.TOKEN);

export const setToken = (token: string) => localStorage.setItem(StorageKeys.TOKEN, token);

export const deleteToken = () => localStorage.removeItem(StorageKeys.TOKEN);

export const getFonts = (): FontMap => {
    try {
        return JSON.parse(localStorage.getItem(StorageKeys.FONTS) ?? "{}");
    } catch (e) {
        console.error(e);
        return {};
    }
}

export const addFont = (name: string, font: FontData) => {
    const fonts = getFonts();
    localStorage.setItem(StorageKeys.FONTS, JSON.stringify({ ...fonts, [name]: font }));
}

export const loadAndSetUsername = async () => {
    if (localStorage.getItem(StorageKeys.USERNAME) === null) {
        const profile = await loadProfile();
        if (profile.login !== undefined) {
            localStorage.setItem(StorageKeys.USERNAME, profile.login);
        }
    }
}

export const getUsername = () => localStorage.getItem(StorageKeys.USERNAME)
