import { type Scene, Vector3 } from "three";
import { create } from "zustand";
import { exportScene } from "../three/utils";

export type SceneDisplayMode = "edit" | "view";

export interface SceneStore {
    scene: Scene | null;
    dirty: boolean;
    size: Vector3;
    stl: string;
    mode: SceneDisplayMode;
    setMode(mode: SceneDisplayMode): void;
    setScene(scene: Scene): void;
    setDirty(dirty: boolean): void;
    setSize(size: Vector3): void;
}

export const useSceneStore = create<SceneStore>((set) => ({
    scene: null,
    dirty: false,
    stl: "",
    mode: "edit",
    size: new Vector3(0, 0, 0),
    setMode: (mode) => {
        set(() => ({ mode }))
    },
    setScene: (scene) => {
        set((_) => ({ scene }));
        const stl = exportScene(scene);
        if (stl === null) {
            return;
        }
        set(() => ({ stl }));
    },
    setDirty: (dirty) => set((_) => ({ dirty })),
    setSize: (size) => set((_) => ({ size })),
}));
