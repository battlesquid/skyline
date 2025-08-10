import * as opentype from "opentype.js";
import { getSvgBoundingBox } from "../utils";
import paper from "paper";

export const getInsetTextGeometry = async (text: string, fontName: string, fontSize: number) => {
    const response = await fetch(`/fonts/ttf/Inter_Bold.ttf`);
    const buffer = await response.arrayBuffer();
    const font = opentype.parse(buffer);
    const textPath = font.getPath(text, 0, fontSize, fontSize).toSVG(5);
    const svg = `<svg>${textPath}</svg>`
    const project = new paper.Project([100, 100]);
    const bb = getSvgBoundingBox(svg);
    const textSvg = project.importSVG(svg);
    const compoundPath = new paper.CompoundPath([
        textSvg
    ]);

    const rectSvg = new paper.Path.Rectangle(
        [0, 0],
        [bb.width, bb.height]
    );
    compoundPath.position = rectSvg.position;
    const result = rectSvg.subtract(compoundPath);
    result.fillColor = new paper.Color("black")
    console.log(result.exportSVG())
    // console.log(svg);
    // console.log(getSvgBoundingBox(svg))
}