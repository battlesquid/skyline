import opentype from "opentype.js";
import {suspend} from "suspend-react";

const FONT_CACHE = new Map<string, opentype.Font>();

const loader = async (url: string) => {
    const cachedFont = FONT_CACHE.get(url);
    if (cachedFont !== undefined) {
        return cachedFont;
    }
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const font = opentype.parse(buffer);
    FONT_CACHE.set(url, font);
    return font;
}

export const useTTFLoader = (url: string) => {
    return suspend(loader, [url]);
}
