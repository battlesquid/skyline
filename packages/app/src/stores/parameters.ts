import type { FontData } from "@react-three/drei";
import { create } from "zustand";
import { getDefaultParameters } from "../defaults";
import type { SkylineBaseShape } from "../three/skyline_base";
import { WEEKS_IN_YEAR, DAYS_IN_WEEK } from "../api/constants";

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
}

export interface SkylineModelParameters {
    inputs: SkylineModelInputParameters;
    computed: SkylineModelComputedParameters;
}

export type ParametersStore = {
    parameters: SkylineModelParameters;
    setParameters: (parameters: Partial<SkylineModelInputParameters>) => void;
};

export const useParametersStore = create<ParametersStore>((set, get) => ({
    parameters: getDefaultParameters(),
    setParameters: (_inputs: Partial<SkylineModelInputParameters>) => {
        const inputs: SkylineModelInputParameters = { ...get().parameters.inputs, ..._inputs };

        const modelLength = WEEKS_IN_YEAR * inputs.towerSize;
        const modelWidth = DAYS_IN_WEEK * inputs.towerSize;
        const platformHeight = inputs.towerSize * 3;
        const platformMidpoint = platformHeight / 2;
        const textSize = platformHeight / 2.2;
        const towerSizeOffset = inputs.towerSize / 2;
        const xMidpointOffset = modelLength / 2;
        const yMidpointOffset = modelWidth / 2;
        const paddingWidth = inputs.padding * 2;

        const computed: SkylineModelComputedParameters = {
            modelLength,
            modelWidth,
            platformMidpoint,
            platformHeight,
            textSize,
            towerSizeOffset,
            xMidpointOffset,
            yMidpointOffset,
            paddingWidth
        }

        set(() => ({ parameters: { inputs, computed } }))
    }
}));
