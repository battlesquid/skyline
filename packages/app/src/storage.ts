import { FontData } from "@react-three/drei";
import { FontMap } from "./stores";

const StorageKeys = {
    TOKEN: "token",
    FONTS: "fonts"
}

export const getToken = () => localStorage.getItem(StorageKeys.TOKEN);

export const setToken = (token: string) => localStorage.setItem(StorageKeys.TOKEN, token);

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
