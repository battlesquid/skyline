import { create } from "zustand";

export interface ModelVariables {
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

export interface ModelVariablesStore {
    variables: ModelVariables;
    setModelVariables: (variables: ModelVariables) => void;
}

export const useModelVariablesStore = create<ModelVariablesStore>((set) => ({
    variables: {
        modelLength: 0,
        modelWidth: 0,
        platformMidpoint: 0, 
        platformHeight: 0,
        textSize: 0,
        towerSizeOffset: 0,
        xMidpointOffset: 0,
        yMidpointOffset: 0,
        paddingWidth: 0
    },
    setModelVariables: (variables) => set(() => ({ variables }))
}))