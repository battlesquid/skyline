import { Button, Text } from "@mantine/core";
import { useShallow } from "zustand/shallow";
import { useParametersContext } from "../../stores/parameters";
import { useSceneStore } from "../../stores/scene";
import { exportScene, getDimensionsText } from "../../three/utils";

export function ExportButton() {
	const filename = useParametersContext((state) => state.inputs.filename);
	const scale = useParametersContext((state) => state.inputs.scale);
	const defaultFilename = useParametersContext(
		(state) => state.computed.defaultFilename,
	);

	const scene = useSceneStore((state) => state.scene);
	const dirty = useSceneStore((state) => state.dirty);
	const size = useSceneStore(useShallow((state) => state.size));

	return (
		<Button
			fullWidth
			loading={scene === null || dirty}
			disabled={scene === null || dirty}
			onClick={() =>
				exportScene(
					scene,
					filename.trim() === "" ? defaultFilename : filename,
					scale,
				)
			}
		>
			<div>
				<Text fw={900} size="sm">
					Export
				</Text>
				<Text size="xs">{getDimensionsText(scale, size)}</Text>
			</div>
		</Button>
	);
}
