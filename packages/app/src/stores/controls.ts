import { create } from "zustand";

export enum ControlsCommand {
    Reset = "reset",
    TogglePerspective = "toggle-perspective",
    ToggleRotate = "toggle-rotate",
}

export type ProjectionMode = "perspective" | "orthographic";

export interface ControlsStore {
    command: ControlsCommand | null;
    setCommand(command: ControlsCommand): void;
    clearCommand(): void;

    autoRotate: boolean;
    toggleAutoRotate(): void;

    projectionMode: ProjectionMode;
    toggleProjectionMode(): void;
}


export const useControlsStore = create<ControlsStore>((set) => ({
    command: null,
    setCommand: (command: ControlsCommand) => set(() => ({ command })),
    clearCommand: () => set(() => ({ command: null })),
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
