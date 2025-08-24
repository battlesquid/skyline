import { useEffect, useState } from "react";
import type { Group, InstancedMesh } from "three";
import { exportTo3MF } from "three-3mf-exporter";
import { SceneUtils, STLExporter } from "three-stdlib";
import { SkylineObjectNames } from "./utils";

export enum ExportFormat {
    Stl = "stl",
    ThreeMF = "3mf"
}

export type Exporter = (group: Group) => Promise<string>;

const EXPORT_MAP: Record<ExportFormat, Exporter> = {
    [ExportFormat.Stl]: async (model) => {
        const exporter = new STLExporter();
        const data = exporter.parse(model, { binary: true });
        return URL.createObjectURL(new Blob([data], { type: "application/octet-stream" }));
    },
    [ExportFormat.ThreeMF]: async (model) => {
        const data = await exportTo3MF(model)
        return URL.createObjectURL(new Blob([data], { type: "application/octet-stream" }));
    }
}

const getModel = (model: Group, scale: number) => {
    const prepareModel = model.clone();
    const exportGroup = prepareModel.getObjectByName(SkylineObjectNames.TowersExportGroup) as Group;
    const instances = prepareModel.getObjectByName(SkylineObjectNames.Towers) as InstancedMesh;

    // TODO: make custom version of this that exports with buffer attribute materials
    // Currently doesn't export individual tower colors
    const meshes = SceneUtils.createMeshesFromInstancedMesh(instances);

    meshes.position.set(0, meshes.position.y, 0);
    meshes.updateMatrix();

    exportGroup.add(meshes);

    const instancesGroup = prepareModel.getObjectByName(SkylineObjectNames.TowersParent) as Group;
    instancesGroup.removeFromParent();
    instances.removeFromParent();

    prepareModel.rotation.set(Math.PI / 2, 0, 0);
    prepareModel.scale.set(scale, scale, scale);
    prepareModel.updateMatrixWorld();
    return prepareModel;
}

const loader = async (
    model: Group | null,
    scale: number,
    format: ExportFormat
) => {
    if (model === null) {
        console.warn("Model is null, skipping export");
        return;
    }
    const preparedModel = getModel(model, scale);
    return EXPORT_MAP[format](preparedModel);
};

export function useExportedModel(model: Group | null, scale: number, format: ExportFormat) {
    const [downloadLink, setDownloadLink] = useState<string>("");
    const [exporting, setExporting] = useState(true);
    useEffect(() => {
        setExporting(true);
        loader(model, scale, format)
        .then(result => {
            if (result !== undefined) {
                setDownloadLink(result);
            }
        })
        .finally(() => setExporting(false))
        
    }, [model, scale, format]);
    return { downloadLink, exporting }
}
