import type * as opentype from "opentype.js";
import paper from "paper";
import { getSvgBoundingBox } from "../utils";

export const getInsetTextSvg = (text: string, font: opentype.Font | null, fontSize: number) => {
    if (font === null) {
        return;
    }

    const textPath = font.getPath(text, 0, fontSize, fontSize).toSVG(5);
    const svg = `<svg>${textPath}</svg>`
    const project = new paper.Project([100, 100]);
    const bb = getSvgBoundingBox(svg);
    const textSvg = project.importSVG(svg);
    const compoundPath = new paper.CompoundPath([
        textSvg
    ]);

    const padding = 3;
    const rectSvg = new paper.Path.Rectangle(
        [0, 0],
        [bb.width + padding, bb.height + padding]
    );
    compoundPath.position = rectSvg.position;
    const result = rectSvg.subtract(compoundPath);
    result.fillColor = new paper.Color("black");
    const output = `<svg xmlns="http://www.w3.org/2000/svg">${result.exportSVG({ asString: true })}</svg>`;
    return output;
}