import { create } from "zustand";
import { useTTFLoader } from "../hooks/useTTFLoader";

const FONT_KEY = "fonts";

interface FontStore {
	fonts: FontMap;
	addFont(name: string, url: string): boolean;
}

export type FontMap = Record<string, string>;

export const DEFAULT_FONTS = Object.freeze({
	"Inter Bold": "/fonts/ttf/Inter_Bold.ttf",
	Quicksilver: "/fonts/ttf/Quicksilver_Regular.ttf",
	Inter: "/fonts/ttf/Inter_Regular.ttf",
	"Press Start": "/fonts/ttf/PressStart2P_Regular.ttf",
	"Arvo Bold": "/fonts/ttf/Arvo_Bold.ttf",
	"Space Mono": "/fonts/ttf/SpaceMono-Bold.ttf",
	"Bebas Neue": "/fonts/ttf/BebasNeue_Regular.ttf",
	"Noto Serif": "/fonts/ttf/NotoSerif.ttf",
});

export const DEFAULT_FONT_SELECTION = "Inter Bold";

export const DEFAULT_FONT = DEFAULT_FONTS[DEFAULT_FONT_SELECTION];

export const preloadDefaultFonts = () => {
	Object.values(DEFAULT_FONTS).forEach(useTTFLoader.preload);
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
		...DEFAULT_FONTS,
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
