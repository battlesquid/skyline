import type { Group } from "three";
import { create } from "zustand";

export interface ModelStore {
    model: Group | null;
    dirty: boolean;
    setModel(scene: Group): void;
    setDirty(dirty: boolean): void;
}

export const useModelStore = create<ModelStore>((set) => ({
    model: null,
    dirty: false,
    setModel: (model) => set((_) => ({ model })),
    setDirty: (dirty) => set((_) => ({ dirty })),
}));
