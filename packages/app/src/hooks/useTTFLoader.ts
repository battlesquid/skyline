import type { Vec2 } from "manifold-3d";
import opentype from "opentype.js";
import { pointsOnPath } from "points-on-path";
import { preload, suspend } from "suspend-react";

const FONT_CACHE = new Map<string, opentype.Font>();

export const toPolygons = (path: string) => {
	const polygons = pointsOnPath(path);
	return polygons.map((points) => points.map((p) => [p[0], p[1]] as Vec2));
}

export const textToPolygons = (
	font: opentype.Font,
	text: string,
	fontSize: number = 1,
) => {
	const paths = font.getPaths(text, 0, fontSize, fontSize);
	const svgs = paths.map((path) => path.toPathData(5));
	return svgs.flatMap(toPolygons);
};

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
};

export function useTTFLoader(url: string) {
	return suspend(loader, [url]);
}

useTTFLoader.preload = (url: string) => preload(loader, [url]);
