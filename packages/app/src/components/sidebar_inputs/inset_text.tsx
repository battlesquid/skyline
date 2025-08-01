import { Checkbox } from "@mantine/core";
import { useParametersStore } from "../../stores/parameters";

export function InsetTextCheckbox() {
    const insetText = useParametersStore((state) => state.inputs.insetText);
    const setInputs = useParametersStore((state) => state.setInputs);

    return (
        <Checkbox
            label="Inset Text"
            checked={insetText}
            onChange={e => setInputs({ insetText: e.currentTarget.checked })}
        />
    );
}