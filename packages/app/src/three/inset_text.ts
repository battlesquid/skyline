import * as opentype from "opentype.js";
import { getSvgBoundingBox } from "../utils";

export const getInsetTextGeometry = async (text: string, fontName: string, fontSize: number) => {
    const response = await fetch(`/fonts/ttf/Inter_Bold.ttf`);
    const buffer = await response.arrayBuffer();
    const font = opentype.parse(buffer);
    const svg = font.getPath(text, 0, fontSize, fontSize).toSVG(2);
    console.log(svg);
    console.log(getSvgBoundingBox(svg))
}