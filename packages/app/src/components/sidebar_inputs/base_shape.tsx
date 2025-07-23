import { Select } from "@mantine/core";
import { useParametersStore } from "../../stores/parameters";
import { SkylineBaseShape } from "../../three/types";
import { capitalize } from "../../utils";

export function BaseShapeInput() {
	const setInputs = useParametersStore((state) => state.setInputs);
	return (
		<Select
			label="Base Shape"
			data={[
				{
					value: SkylineBaseShape.Prism,
					label: capitalize(SkylineBaseShape.Prism),
				},
				{
					value: SkylineBaseShape.Frustum,
					label: capitalize(SkylineBaseShape.Frustum),
				},
			]}
			defaultValue={SkylineBaseShape.Prism}
			allowDeselect={false}
			onChange={(value) => {
				if (value === null) {
					return;
				}
				setInputs({ shape: value as SkylineBaseShape });
			}}
		/>
	);
}
