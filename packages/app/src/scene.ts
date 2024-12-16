import { Scene } from "three";
import { create } from "zustand";

export interface SceneStore {
    scene: Scene | null;
    setScene(scene: Scene): void;
}

export const useSceneStore = create<SceneStore>(set => ({
    scene: null,
    setScene: (scene) => set((state) => ({ scene }))
}));
