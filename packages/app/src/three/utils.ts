import type { Box3, Group, InstancedMesh, Mesh, Vector3 } from "three";
import { SceneUtils, STLExporter } from "three-stdlib";

export const SkylineObjectNames = {
    Root: "root",
    Towers: "towers",
    TowersParent: "towers-parent",
    TowersExportGroup: "towers-export-group",
    Base: "base"
}

export interface Dimensions {
	width: number;
	height: number;
}

export const getDimensions = (mesh: Mesh | null): Dimensions => {
	if (mesh === null) {
		return { width: 0, height: 0 };
	}
	mesh.geometry.computeBoundingBox();
	mesh.geometry.center();
	if (mesh?.geometry.boundingBox === null) {
		return { width: 0, height: 0 };
	}
	return {
		width: mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x,
		height: mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y,
	};
};

export const exportScene = (
	group: Group | null,
	name: string,
	scale: number,
) => {
	if (group === null) {
		console.warn("Scene is null, skipping export");
		return;
	}
	const clone = group.clone();
	const exportGroup = clone.getObjectByName("export_group");
	const instances = clone.getObjectByName("instances") as InstancedMesh;

	const meshes = SceneUtils.createMeshesFromInstancedMesh(instances);

	meshes.position.set(0, meshes.position.y, 0);
	meshes.updateMatrix();

	// TODO: make this more bulletproof
	exportGroup?.add(meshes);

	const instancesGroup = clone.getObjectByName("instances_group");
	if (instancesGroup !== undefined) {
		instancesGroup.removeFromParent();
		instances.removeFromParent();
	}

	const grid = clone.getObjectByName("grid");
	if (grid !== undefined) {
		grid.removeFromParent();
	}

	clone.rotation.set(Math.PI / 2, 0, 0);
	clone.scale.set(scale, scale, scale);
	clone.updateMatrixWorld();
	const exporter = new STLExporter();
	const data = exporter.parse(clone);
	const link = document.createElement("a");
	link.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
	link.download = `${name}.stl`;
	link.click();
};

export const getDimensionsText = (scale: number, size: Vector3) => {
	return `${Math.round(size.x * scale)}mm × ${Math.round(size.y * scale)}mm × ${Math.round(size.z * scale)}mm`;
};

export const getBoundingBoxVolume = (bb: Box3) => {
	const x = bb.max.x - bb.min.x;
	const y = bb.max.y - bb.min.y;
	const z = bb.max.z - bb.min.z;
	return x * y * z;
};
