import { type Group, Vector3 } from "three";
import { create } from "zustand";

export interface ModelStore {
	model: Group | null;
	dirty: boolean;
	size: Vector3;
	setModel(scene: Group): void;
	setDirty(dirty: boolean): void;
	setSize(size: Vector3): void;
}

export const useModelStore = create<ModelStore>((set) => ({
	model: null,
	dirty: false,
	size: new Vector3(0, 0, 0),
	setModel: (model) => set((_) => ({ model })),
	setDirty: (dirty) => set((_) => ({ dirty })),
	setSize: (size) => set((_) => ({ size })),
}));
