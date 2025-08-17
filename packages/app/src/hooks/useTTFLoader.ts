import opentype from "opentype.js";
import {suspend} from "suspend-react";

const FONT_CACHE: Record<string, opentype.Font> = {};

const loader = async (url: string) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const font = opentype.parse(buffer);
    FONT_CACHE[url] = font;
}

export const useTTFLoader = () => {
    return suspend(loader, [])
}