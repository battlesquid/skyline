import { Button, Text } from "@mantine/core";
import { Suspense } from "react";
import { useShallow } from "zustand/shallow";
import { useModelStore } from "../../stores/model";
import { useParametersContext } from "../../stores/parameters";
import { useExportedModel } from "../../three/export";
import { getDimensionsText } from "../../three/utils";

export function ExportButton() {
    const filename = useParametersContext((state) => state.computed.resolvedFilename);
    const format = useParametersContext((state) => state.inputs.exportFormat)
    const scale = useParametersContext((state) => state.inputs.scale);

    const model = useModelStore((state) => state.model);
    const dirty = useModelStore((state) => state.dirty);
    const size = useModelStore(useShallow((state) => state.size));
    const { downloadLink, exporting } = useExportedModel(model, scale, format);

    return (
        <Suspense>
            <Button
                fullWidth
                loading={model === null || dirty || exporting}
                disabled={model === null || dirty || exporting}
                component="a"
                href={downloadLink}
                download={`${filename}.${format}`}
            >
                <div>
                    <Text fw={900} size="sm">
                        Export
                    </Text>
                    <Text size="xs">{getDimensionsText(scale, size)}</Text>
                </div>
            </Button>
        </Suspense>
    );
}
