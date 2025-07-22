import { Button, Text } from "@mantine/core";
import { useSceneStore } from "../../stores/scene";
import { exportScene, getDimensionsText } from "../../three/utils";
import { useParametersStore } from "../../stores/parameters";
import { useShallow } from "zustand/shallow";

export function ExportButton() {
    const filename = useParametersStore(state => state.inputs.filename);
    const scale = useParametersStore(state => state.inputs.scale);
    const defaultFilename = useParametersStore(state => state.computed.defaultFilename);

    const scene = useSceneStore(state => state.scene);
    const dirty = useSceneStore(state => state.dirty);
    const size = useSceneStore(useShallow(state => state.size));

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