import { FontData, useFont } from "@react-three/drei";
import { Font } from "three-stdlib";
import { create } from "zustand";
import { getDefaultFonts } from "../defaults";
import { getFonts, addFont } from "../storage";

export type FontMap = Record<string, string | FontData>;

interface FontStore {
    fonts: FontMap;
    addFont(name: string, font: FontData): boolean;
}

export const preloadDefaultFonts = () => {
    Object.values(getDefaultFonts()).forEach(useFont.preload);
}

export const useFontStore = create<FontStore>(set => ({
    fonts: {
        ...getDefaultFonts(),
        ...getFonts(),
    },
    addFont: (name, font) => {
        try {
            new Font(font).generateShapes("");
            useFont.preload(font);
            set(state => ({ fonts: { ...state.fonts, [name]: font } }));
            addFont(name, font);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
}));
