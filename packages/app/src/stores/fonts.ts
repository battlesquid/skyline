import { type FontData, useFont } from "@react-three/drei";
import { Font } from "three-stdlib";
import { create } from "zustand";
import { getDefaultFonts } from "../defaults";

const FONT_KEY = "fonts";

export type FontMap = Record<string, string | FontData>;

interface FontStore {
	fonts: FontMap;
	addFont(name: string, font: FontData): boolean;
}

export const preloadDefaultFonts = () => {
	Object.values(getDefaultFonts()).forEach(useFont.preload);
};

export const getFontsLocal = (): FontMap => {
	try {
		return JSON.parse(localStorage.getItem(FONT_KEY) ?? "{}");
	} catch (e) {
		console.error(e);
		return {};
	}
};

export const addFontLocal = (name: string, font: FontData) => {
	const fonts = getFontsLocal();
	localStorage.setItem(FONT_KEY, JSON.stringify({ ...fonts, [name]: font }));
};

export const useFontStore = create<FontStore>((set) => ({
	fonts: {
		...getDefaultFonts(),
		...getFontsLocal(),
	},
	addFont: (name, font) => {
		try {
			new Font(font).generateShapes("");
			useFont.preload(font);
			set((state) => ({ fonts: { ...state.fonts, [name]: font } }));
			addFontLocal(name, font);
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	},
}));
