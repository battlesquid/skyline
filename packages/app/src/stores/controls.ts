import { create } from "zustand";

export type ProjectionMode = "perspective" | "orthographic";

export interface ControlsStore {
    reset: true | null;
    resetView(): void;
    clearReset(): void;

    autoRotate: boolean;
    toggleAutoRotate(): void;

    projectionMode: ProjectionMode;
    toggleProjectionMode(): void;
}


export const useControlsStore = create<ControlsStore>((set) => ({
    reset: null,
    resetView: () => set(() => ({ reset: true })),
    clearReset: () => set(() => ({ reset: null })),
    autoRotate: false,
    toggleAutoRotate: () => set(state => ({ autoRotate: !state.autoRotate })),
    projectionMode: "perspective",
    toggleProjectionMode: () => set((state) => {
        const projectionMode = state.projectionMode === "perspective"
            ? "orthographic"
            : "perspective";
        return ({ projectionMode })
    })
}));
