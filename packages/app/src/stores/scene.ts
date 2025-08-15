import { CSGGeometryRef } from "@react-three/csg";
import { type Scene, Vector3 } from "three";
import { create } from "zustand";

export interface SceneStore {
	scene: Scene | null;
	dirty: boolean;
	size: Vector3;
	base: CSGGeometryRef | null;
	setScene(scene: Scene): void;
	setDirty(dirty: boolean): void;
	setSize(size: Vector3): void;
	setBaseRef(ref: CSGGeometryRef): void
}

export const useSceneStore = create<SceneStore>((set) => ({
	scene: null,
	dirty: false,
	size: new Vector3(0, 0, 0),
	base: null,
	setScene: (scene) => set((_) => ({ scene })),
	setDirty: (dirty) => set((_) => ({ dirty })),
	setSize: (size) => set((_) => ({ size })),
	setBaseRef: (base) => set((_) => ({base}))
}));
