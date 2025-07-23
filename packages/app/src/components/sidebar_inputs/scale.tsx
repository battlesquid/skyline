import { NumberInput } from "@mantine/core";
import { useParametersStore } from "../../stores/parameters";
import { safeFloat } from "../../utils";

export function ScaleInput() {
	const scale = useParametersStore((state) => state.inputs.scale);
	const setInputs = useParametersStore((state) => state.setInputs);

	return (
		<NumberInput
			label="Scale"
			placeholder="Scale"
			min={1}
			step={0.1}
			value={scale}
			onChange={(value) => setInputs({ scale: safeFloat(value, 1) })}
		/>
	);
}
