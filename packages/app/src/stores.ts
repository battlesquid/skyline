import { FontData, useFont } from "@react-three/drei";
import { Group } from "three";
import { Font } from "three-stdlib";
import { create } from "zustand";
import { addFont, getFonts } from "./storage";

interface ModelStore {
    model: Group | null;
    dirty: boolean;
    setModel(model: Group): void;
    setDirty(dirty: boolean): void;
}

export const useModelStore = create<ModelStore>(set => ({
    model: null,
    dirty: false,
    setModel: (model) => set(_ => ({ model })),
    setDirty: (dirty) => set(_ => ({ dirty }))
}));

export type FontMap = Record<string, string | FontData>;

interface FontStore {
    fonts: FontMap;
    addFont(name: string, font: FontData): boolean;
}

export const DEFAULT_FONT_SELECTION = "Inter Bold";

export const defaultFonts = {
    "Inter Bold": "/Inter_Bold.json",
    "Press Start": "/Press Start 2P_Regular.json",
    "Arvo Bold": "/Arvo_Bold.json",
    "Bebas Neue": "/Bebas Neue_Regular.json",
    "Quicksilver": "/Quicksilver_Regular.json"
}

export const preloadDefaultFonts = () => {
    Object.values(defaultFonts).forEach(useFont.preload);
}

export const useFontStore = create<FontStore>(set => ({
    fonts: {
        ...defaultFonts,
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
