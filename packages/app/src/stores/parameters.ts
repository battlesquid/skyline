import type { FontData } from "@react-three/drei";
import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "../api/constants";
import { formatYearText } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import type { SkylineBaseShape } from "../three/types";
import { safeString } from "../utils";

export interface SkylineModelInputParameters {
    name: string;
    nameOverride: string;
    insetText: boolean;
    insetDepth: number;
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
    logoOffset: number;
    nameOffset: number;
    yearOffset: number;
}

export interface SkylineModelComputedParameters {
    modelLength: number;
    modelWidth: number;
    halfPlatformHeight: number;
    platformHeight: number;
    textSize: number;
    towerSizeOffset: number;
    halfModelLength: number;
    halfModelWidth: number;
    paddingWidth: number;
    formattedYear: string;
    defaultFilename: string;
    resolvedName: string;
    renderColor: string;
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
            const halfPlatformHeight = platformHeight / 2;
            const textSize = platformHeight / 2.2;
            const towerSizeOffset = inputs.towerSize / 2;
            const halfModelLength = modelLength / 2;
            const halfModelWidth = modelWidth / 2;
            const paddingWidth = inputs.padding * 2;
            const formattedYear = formatYearText(inputs.startYear, inputs.endYear);
            const defaultFilename = `${inputs.name}_${formattedYear}_skyline`;
            const resolvedName = safeString(inputs.nameOverride, inputs.name);
            const renderColor = inputs.showContributionColor ? getDefaultParameters().inputs.color : inputs.color; 

            const computed: SkylineModelComputedParameters = {
                modelLength,
                modelWidth,
                halfPlatformHeight,
                platformHeight,
                textSize,
                towerSizeOffset,
                halfModelLength,
                halfModelWidth,
                paddingWidth,
                defaultFilename,
                formattedYear,
                resolvedName,
                renderColor,
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
