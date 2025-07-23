import { NumberInput } from "@mantine/core";
import { useParametersStore } from "../../stores/parameters";
import { safeFloat } from "../../utils";

export function BasePaddingInput() {
    const padding = useParametersStore(state => state.inputs.padding);
    const setInputs = useParametersStore(state => state.setInputs);

    return (
        <NumberInput
            label="Base Padding"
            placeholder="Base Padding"
            min={0}
            step={0.5}
            value={padding}
            onChange={(value) =>
                setInputs({
                    padding: safeFloat(value, 0),
                })
            }
        />
    )
}