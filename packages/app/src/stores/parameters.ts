import type { FontData } from "@react-three/drei";
import { create } from "zustand";
import { getDefaultParameters } from "../defaults";

export interface SkylineModelParameters {
	name: string;
	startYear: number;
	endYear: number;
	towerSize: number;
	dampening: number;
	font: string | FontData;
	padding: number;
	textDepth: number;
	color: string;
	showContributionColor: boolean;
}

export type ParametersStore = {
	parameters: SkylineModelParameters;
	setParameters: (parameters: SkylineModelParameters) => void;
};

export const useParametersStore = create<ParametersStore>((set) => ({
	parameters: getDefaultParameters(),
	setParameters: (parameters: SkylineModelParameters) =>
		set(() => ({ parameters })),
}));
