import { TextInput } from "@mantine/core";
import { useParametersContext } from "../../stores/parameters";

export function FilenameInput() {
	const filename = useParametersContext((state) => state.inputs.filename);
	const defaultFilename = useParametersContext(
		(state) => state.computed.defaultFilename,
	);
	const setInputs = useParametersContext((state) => state.setInputs);

	return (
		<TextInput
			label="File Name"
			placeholder={defaultFilename}
			value={filename}
			onChange={(e) => setInputs({ filename: e.target.value })}
		/>
	);
}
