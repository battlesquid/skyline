import { FontData } from "@react-three/drei";

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
    font: "/Inter_Bold.json",
    showContributionColor: false,
    padding: 0.5,
    textDepth: 0.25,
    towerSize: 0.6,
    towerDampening: 4
}
