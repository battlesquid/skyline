import type { FontData } from "@react-three/drei";
import { create, createStore, useStore } from "zustand";
import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "../api/constants";
import { formatYearText } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import type { SkylineBaseShape } from "../three/types";
import { createContext, useContext } from "react";
import { storageElement } from "three/src/nodes/utils/StorageArrayElementNode.js";

export interface SkylineModelInputParameters {
	name: string;
	nameOverride: string;
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

export const createParametersStore = (props?: Partial<SkylineModelInputParameters>) => {
	const allInputProps = { ...DEFAULT_PARAMETERS.inputs, ...props }
	const allComputedProps = DEFAULT_PARAMETERS.computed;

	return createStore<ParametersStore>()((set, get) => ({
		inputs: allInputProps,
		computed: allComputedProps,
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
	}))
}

export const getParametersStore = () => {
	const store = useContext(ParametersContext);
	if (store === null) {
		throw new Error('Missing ParametersContext.Provider in the tree')
	}
	return store;
}

export const ParametersContext = createContext<ReturnType<typeof createParametersStore> | null>(null);

export const useParametersContext = <T>(selector: (state: ParametersStore) => T): T => {
	const store = getParametersStore();
	return useStore(store, selector);
}


// export const useParametersStore = create<ParametersStore>((set, get) => ({
// 	inputs: DEFAULT_PARAMETERS.inputs,
// 	computed: DEFAULT_PARAMETERS.computed,
// 	setInputs: (_inputs: Partial<SkylineModelInputParameters>) => {
// 		const inputs: SkylineModelInputParameters = {
// 			...get().inputs,
// 			..._inputs,
// 		};

// 		const modelLength = WEEKS_IN_YEAR * inputs.towerSize;
// 		const modelWidth = DAYS_IN_WEEK * inputs.towerSize;
// 		const platformHeight = inputs.towerSize * 3;
// 		const platformMidpoint = platformHeight / 2;
// 		const textSize = platformHeight / 2.2;
// 		const towerSizeOffset = inputs.towerSize / 2;
// 		const xMidpointOffset = modelLength / 2;
// 		const yMidpointOffset = modelWidth / 2;
// 		const paddingWidth = inputs.padding * 2;
// 		const defaultFilename = `${inputs.name}_${formatYearText(inputs.startYear, inputs.endYear)}_skyline`;

// 		const computed: SkylineModelComputedParameters = {
// 			modelLength,
// 			modelWidth,
// 			platformMidpoint,
// 			platformHeight,
// 			textSize,
// 			towerSizeOffset,
// 			xMidpointOffset,
// 			yMidpointOffset,
// 			paddingWidth,
// 			defaultFilename,
// 		};

// 		set(() => ({ inputs, computed }));
// 	},
// }));
