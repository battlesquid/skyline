import {
	type Box3,
	Color,
	Group,
	type InstancedMesh,
	Mesh,
	MeshStandardMaterial,
	type Vector3,
} from "three";

export const SkylineObjectNames = {
	Root: "root",
	Towers: "towers",
	TowersParent: "towers-parent",
	TowersExportGroup: "towers-export-group",
	Base: "base",
};

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

export const getDimensionsText = (scale: number, size: Vector3) => {
	return `${Math.round(size.x * scale)}mm × ${Math.round(size.y * scale)}mm × ${Math.round(size.z * scale)}mm`;
};

export const getBoundingBoxVolume = (bb: Box3) => {
	const x = bb.max.x - bb.min.x;
	const y = bb.max.y - bb.min.y;
	const z = bb.max.z - bb.min.z;
	return x * y * z;
};

/**
 * Adapted from the original SceneUtils.createMeshesFromInstancedMesh
 *
 */
export const createMeshesFromInstancedMesh = (instancedMesh: InstancedMesh) => {
	const group = new Group();

	const count = instancedMesh.count;
	const geometry = instancedMesh.geometry;
	const instancedMaterial = instancedMesh.material as MeshStandardMaterial;
	const materialColorMap = new Map<string, MeshStandardMaterial>();
	const instancedColor = new Color();

	for (let i = 0; i < count; i++) {
		instancedMesh.getColorAt(i, instancedColor);
		const hexColor = instancedColor.getHexString();
		const currentMaterial = materialColorMap.get(hexColor);

		let mesh: Mesh;
		if (currentMaterial !== undefined) {
			mesh = new Mesh(geometry, currentMaterial);
		} else {
			const mat = new MeshStandardMaterial().copy(instancedMaterial);
			mat.color.set(instancedColor);
			materialColorMap.set(hexColor, mat);
			mesh = new Mesh(geometry, mat);
		}

		instancedMesh.getMatrixAt(i, mesh.matrix);
		mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
		group.add(mesh);
	}

	group.copy(instancedMesh);
	group.updateMatrixWorld(); // ensure correct world matrices of meshes

	return group;
};
