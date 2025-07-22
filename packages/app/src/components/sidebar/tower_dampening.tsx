import { useParametersStore } from "../../stores/parameters"
import { NumberInput } from "@mantine/core";
import { safeInt } from "../../utils";

export function TowerDampeningInput() {
    const dampening = useParametersStore(state => state.inputs.dampening);
    const setInputs = useParametersStore(state => state.setInputs);
    return (
        <NumberInput
            label="Tower Dampening"
            placeholder="Tower Dampening"
            min={1}
            allowDecimal={false}
            value={dampening}
            onChange={(value) =>
                setInputs({
                    dampening: safeInt(value, 1),
                })
            }
        />
    )
}