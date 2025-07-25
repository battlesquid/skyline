import { TextInput } from "@mantine/core";
import { useParametersStore } from "../../stores/parameters";

export function UsernameOverrideInput() {
    const nameOverride = useParametersStore((state) => state.inputs.nameOverride);
    const setInputs = useParametersStore((state) => state.setInputs);

    return (
        <TextInput
            label="Username Override"
            value={nameOverride}
            placeholder="Name Override"
            onChange={(e) => setInputs({ nameOverride: e.target.value })}
        />
    );
}