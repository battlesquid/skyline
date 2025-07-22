import { TextInput } from "@mantine/core";
import { useShallow } from "zustand/shallow";
import { useParametersStore } from "../../stores/parameters";

export function FilenameInput() {
    const filename = useParametersStore(useShallow(state => state.inputs.filename));
    const defaultFilename = useParametersStore(useShallow(state => state.computed.defaultFilename));
    const setInputs = useParametersStore(state => state.setInputs);

    return (
        <TextInput
            label="File Name"
            placeholder={defaultFilename}
            value={filename}
            onChange={(e) => setInputs({ filename: e.target.value })}
        />
    )
}