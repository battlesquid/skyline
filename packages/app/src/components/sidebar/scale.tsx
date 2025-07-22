import { NumberInput } from "@mantine/core";
import { safeFloat } from "../../utils";
import { useShallow } from "zustand/shallow";
import { useParametersStore } from "../../stores/parameters";

export function ScaleInput() {
    const scale = useParametersStore(useShallow(state => state.inputs.scale));
    const setInputs = useParametersStore(state => state.setInputs);

    return (
        <NumberInput
            label="Scale"
            placeholder="Scale"
            min={1}
            step={0.1}
            value={scale}
            onChange={(value) => setInputs({ scale: safeFloat(value, 1) })}
        />
    )
}