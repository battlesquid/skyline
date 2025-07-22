import { Button, Text } from "@mantine/core";
import { useSceneStore } from "../../stores/scene";
import { exportScene, getDimensionsText } from "../../three/utils";
import { useShallow } from "zustand/shallow";
import { useParametersStore } from "../../stores/parameters";

export function ExportButton() {
    const filename = useParametersStore(useShallow(state => state.inputs.filename));
    const scale = useParametersStore(useShallow(state => state.inputs.scale));
    const defaultFilename = useParametersStore(useShallow(state => state.computed.defaultFilename));

    const scene = useSceneStore(state => state.scene);
    const dirty = useSceneStore(state => state.dirty);
    const size = useSceneStore(state => state.size);

    return (
        <Button
            fullWidth
            loading={scene === null || dirty}
            disabled={scene === null || dirty}
            onClick={() =>
                exportScene(
                    scene,
                    filename.trim() === ""
                        ? defaultFilename
                        : filename,
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
    )
}