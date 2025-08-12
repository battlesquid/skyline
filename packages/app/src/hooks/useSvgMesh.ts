import { useEffect, useState } from "react";
import { ExtrudeGeometry, Group, Mesh, type MeshStandardMaterial } from "three";
import { SVGLoader } from "three-stdlib";
import { Dimensions } from "../three/utils";
import { getSvgBoundingBox, isNullish } from "../utils";

export interface UseSvgMeshOptions {
	svg: string | undefined;
	material: MeshStandardMaterial;
	depth?: number;
	castShadow?: boolean;
	receiveShadow?: boolean;
	group?: Group | null;
	onGroupReady?: (group: Group) => void;
}

export const useSvgMesh = ({
	svg,
	material,
	depth = 3,
	castShadow = true,
	receiveShadow = false,
	group,
	onGroupReady
}: UseSvgMeshOptions) => {
	const loader = new SVGLoader();
	const [meshes, setMeshes] = useState<Mesh[]>([]);
	const [boundingBox, setBoundingBox] = useState<Dimensions>({ width: 0, height: 0 })

	useEffect(() => {
		if (svg === undefined) {
			return;
		}
		const meshes: Mesh[] = [];
		const data = loader.parse(svg);
		for (const path of data.paths) {
			const shapes = path.toShapes(true);
			for (const shape of shapes) {
				const geometry = new ExtrudeGeometry(shape, {
					depth,
					bevelEnabled: false,
				});
				const mesh = new Mesh(geometry, material);
				mesh.castShadow = castShadow;
				mesh.receiveShadow = receiveShadow;
				meshes.push(mesh);
			}
		}
		setMeshes(meshes);
		setBoundingBox(getSvgBoundingBox(svg));
	}, [svg, depth, castShadow, receiveShadow]);

	useEffect(() => {
		if (!isNullish(group) && !isNullish(onGroupReady)) {
			group.clear();
			for (const mesh of meshes) {
				group.add(mesh);
			}
			onGroupReady(group);
		}
	}, [group, onGroupReady])

	useEffect(() => {
		for (const mesh of meshes) {
			mesh.material = material;
		}
	}, [material]);

	return { meshes, boundingBox };
};
