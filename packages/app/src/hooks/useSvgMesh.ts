import { useEffect, useState } from "react";
import { ExtrudeGeometry, Mesh, type MeshStandardMaterial } from "three";
import { SVGLoader } from "three-stdlib";

export const useSvgMesh = (svg: string, material: MeshStandardMaterial) => {
	const loader = new SVGLoader();
	const [meshes, setMeshes] = useState<Mesh[]>([]);

	useEffect(() => {
		const meshes: Mesh[] = [];
		const data = loader.parse(svg);
		for (const path of data.paths) {
			const shapes = path.toShapes(true);
			for (const shape of shapes) {
				const geometry = new ExtrudeGeometry(shape, {
					depth: 200,
					bevelEnabled: false,
				});
				const mesh = new Mesh(geometry, material);
				mesh.castShadow = true;
				meshes.push(mesh);
			}
		}
		setMeshes(meshes);
	}, [svg]);

	useEffect(() => {
		for (const mesh of meshes) {
			mesh.material = material;
		}
	}, [material]);

	return { meshes };
};
