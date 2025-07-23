import type { FontData } from "@react-three/drei";
import { create } from "zustand";
import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "../api/constants";
import { formatYearText } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import type { SkylineBaseShape } from "../three/types";

export interface SkylineModelInputParameters {
	name: string;
	startYear: number;
	endYear: number;
	towerSize: number;
	dampening: number;
	font: string | FontData;
	shape: SkylineBaseShape;
	padding: number;
	textDepth: number;
	color: string;
	showContributionColor: boolean;
	filename: string;
	scale: number;
}

export interface SkylineModelComputedParameters {
	modelLength: number;
	modelWidth: number;
	platformMidpoint: number;
	platformHeight: number;
	textSize: number;
	towerSizeOffset: number;
	xMidpointOffset: number;
	yMidpointOffset: number;
	paddingWidth: number;
	defaultFilename: string;
}

export interface SkylineModelParameters {
	inputs: SkylineModelInputParameters;
	computed: SkylineModelComputedParameters;
}

export type ParametersStore = {
	inputs: SkylineModelInputParameters;
	computed: SkylineModelComputedParameters;
	setInputs: (parameters: Partial<SkylineModelInputParameters>) => void;
};

const DEFAULT_PARAMETERS = getDefaultParameters();

export const useParametersStore = create<ParametersStore>((set, get) => ({
	inputs: DEFAULT_PARAMETERS.inputs,
	computed: DEFAULT_PARAMETERS.computed,
	setInputs: (_inputs: Partial<SkylineModelInputParameters>) => {
		const inputs: SkylineModelInputParameters = {
			...get().inputs,
			..._inputs,
		};

		const modelLength = WEEKS_IN_YEAR * inputs.towerSize;
		const modelWidth = DAYS_IN_WEEK * inputs.towerSize;
		const platformHeight = inputs.towerSize * 3;
		const platformMidpoint = platformHeight / 2;
		const textSize = platformHeight / 2.2;
		const towerSizeOffset = inputs.towerSize / 2;
		const xMidpointOffset = modelLength / 2;
		const yMidpointOffset = modelWidth / 2;
		const paddingWidth = inputs.padding * 2;
		const defaultFilename = `${inputs.name}_${formatYearText(inputs.startYear, inputs.endYear)}_skyline`;

		const computed: SkylineModelComputedParameters = {
			modelLength,
			modelWidth,
			platformMidpoint,
			platformHeight,
			textSize,
			towerSizeOffset,
			xMidpointOffset,
			yMidpointOffset,
			paddingWidth,
			defaultFilename,
		};

		set(() => ({ inputs, computed }));
	},
}));
