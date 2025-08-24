import type { Group, InstancedMesh } from "three";
import { SceneUtils, STLExporter } from "three-stdlib";
import { SkylineObjectNames } from "./utils";

export type ExportFormat = "stl" | "3mf";

const EXPORT_MAP: Record<ExportFormat, () => void> = {
    stl: () => {

    },
    "3mf": () => {

    }
}

const getModel = (group: Group, scale: number) => {
    const clone = group.clone();
    const exportGroup = clone.getObjectByName(SkylineObjectNames.TowersExportGroup) as Group;
    const instances = clone.getObjectByName(SkylineObjectNames.Towers) as InstancedMesh;

    const meshes = SceneUtils.createMeshesFromInstancedMesh(instances);

    meshes.position.set(0, meshes.position.y, 0);
    meshes.updateMatrix();

    exportGroup.add(meshes);

    const instancesGroup = clone.getObjectByName(SkylineObjectNames.TowersParent) as Group;
    instancesGroup.removeFromParent();
    instances.removeFromParent();

    clone.rotation.set(Math.PI / 2, 0, 0);
    clone.scale.set(scale, scale, scale);
    clone.updateMatrixWorld();
    return clone;
}

export const exportScene = (
    group: Group | null,
    name: string,
    scale: number,
    format: ExportFormat
) => {
    if (group === null) {
        console.warn("Scene is null, skipping export");
        return;
    }
    const model = getModel(group, scale);
    const exporter = new STLExporter();
    const data = exporter.parse(model);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
    link.download = `${name}.${format}`;
    link.click();
};