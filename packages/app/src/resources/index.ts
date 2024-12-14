import { useState } from "react"
import { Font, FontLoader } from "three/addons/loaders/FontLoader.js";

const loader = new FontLoader();
const FONT_MAP: Record<string, Font> = {};

export const getFont = (name: string) => {
    return FONT_MAP[name];
}

export const useResourceLoader = () => {
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadFont = async (path: string) => {
        setLoading(true);
        try {
            const font = await loader.loadAsync(path);
            FONT_MAP[path] = font;
        } catch (e) {
            console.error(`Failed to load font at ${path}`);
        } finally {
            setLoading(false);
        }
    }

    if (!initialized) {
        setLoading(true);
        loadFont("/Inter_Bold")
            .catch(console.error)
            .finally(() => {
                setInitialized(true);
                setLoading(false)
            })
    }

    return {
        loadFont,
        getFont: (path: string) => FONT_MAP[path],
        loading,
        initialized
    }
}