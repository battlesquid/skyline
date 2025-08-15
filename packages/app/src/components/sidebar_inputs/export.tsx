import { Button, Text } from "@mantine/core";
import { useShallow } from "zustand/shallow";
import { useParametersContext } from "../../stores/parameters";
import { useSceneStore } from "../../stores/scene";
import { exportScene, getDimensionsText } from "../../three/utils";
import { useMemo } from "react";
import { Mesh } from "three";

export function ExportButton() {
	const filename = useParametersContext((state) => state.inputs.filename);
	const scale = useParametersContext((state) => state.inputs.scale);
	const defaultFilename = useParametersContext(
		(state) => state.computed.defaultFilename,
	);

	const scene = useSceneStore((state) => state.scene);
	const dirty = useSceneStore((state) => state.dirty);
	const size = useSceneStore(useShallow((state) => state.size));
	const base = useSceneStore(state => state.base);
	const computed = useParametersContext(state => state.computed);
	const meshes = useMemo(() => {
		if (base?.geometry) {
			console.log("base geom exists!")
			const baseMesh = new Mesh(base.geometry);
			baseMesh.position.set(0, -computed.platformMidpoint, 0)
			return [baseMesh]
		}
		return [];
	}, [base])

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
					meshes
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
