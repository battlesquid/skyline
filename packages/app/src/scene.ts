import { Scene } from "three";
import { create } from "zustand";

export interface SceneStore {
    scene: Scene | null;
    dirty: boolean;
    setScene(scene: Scene): void;
    setDirty(dirty: boolean): void;
}

export const useSceneStore = create<SceneStore>(set => ({
    scene: null,
    dirty: false,
    setScene: (scene) => set(_ => ({ scene })),
    setDirty: (dirty) => set(_ => ({ dirty }))
}));
