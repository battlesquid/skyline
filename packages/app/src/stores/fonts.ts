import { create } from "zustand";
import { getDefaultFonts } from "../defaults";
import { useTTFLoader } from "../hooks/useTTFLoader";

const FONT_KEY = "fonts";

export type FontMap = Record<string, string>;

interface FontStore {
	fonts: FontMap;
	addFont(name: string, url: string): boolean;
}

export const preloadDefaultFonts = () => {
	Object.values(getDefaultFonts()).forEach(useTTFLoader.preload);
};

export const getFontsLocal = (): FontMap => {
	try {
		return JSON.parse(localStorage.getItem(FONT_KEY) ?? "{}");
	} catch (e) {
		console.error(e);
		return {};
	}
};

export const addFontLocal = (name: string, font: string) => {
	const fonts = getFontsLocal();
	localStorage.setItem(FONT_KEY, JSON.stringify({ ...fonts, [name]: font }));
};

export const useFontStore = create<FontStore>((set) => ({
	fonts: {
		...getDefaultFonts(),
		...getFontsLocal(),
	},
	addFont: (name, url) => {
		try {
			useTTFLoader.preload(url);
			set((state) => ({ fonts: { ...state.fonts, [name]: url } }));
			addFontLocal(name, url);
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	},
}));
