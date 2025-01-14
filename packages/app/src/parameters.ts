import { FontData } from "@react-three/drei";
import { DEFAULT_FONT_SELECTION, defaultFonts } from "./stores";

export interface SkylineModelParameters {
    name: string;
    year: number;
    towerSize: number;
    towerDampening: number;
    font: string | FontData;
    padding: number;
    textDepth: number;
    color: string;
    showContributionColor: boolean;
}

export const defaults: SkylineModelParameters = {
    name: "Battlesquid",
    year: new Date().getFullYear(),
    color: "#575757",
    font: defaultFonts[DEFAULT_FONT_SELECTION],
    showContributionColor: false,
    padding: 0.5,
    textDepth: 1.75,
    towerSize: 2.5,
    towerDampening: 4
}
