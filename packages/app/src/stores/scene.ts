import { Scene, Vector3 } from "three";
import { create } from "zustand";

interface SceneStore {
    scene: Scene | null;
    dirty: boolean;
    size: Vector3;
    setScene(scene: Scene): void;
    setDirty(dirty: boolean): void;
    setSize(size: Vector3): void;
}

export const useSceneStore = create<SceneStore>(set => ({
    scene: null,
    dirty: false,
    size: new Vector3(0, 0, 0),
    setScene: (scene) => set(_ => ({ scene })),
    setDirty: (dirty) => set(_ => ({ dirty })),
    setSize: (size) => set(_ => ({ size }))
}));
