import { useEffect, useState } from "react";
import { ExtrudeGeometry, Mesh, MeshStandardMaterial } from "three";
import { SVGLoader } from "three-stdlib";

export const useSvgMesh = (svg: string, material: MeshStandardMaterial) => {
    const loader = new SVGLoader();
    const [meshes, setMeshes] = useState<Mesh[]>([]);

    useEffect(() => {
        const meshes: Mesh[] = [];
        const data = loader.parse(svg);
        data.paths.forEach((path) => {
            const shapes = path.toShapes(true);
            shapes.forEach((shape) => {
                const geometry = new ExtrudeGeometry(shape, {
                    depth: 200,
                    bevelEnabled: false
                });
                const mesh = new Mesh(geometry, material);
                mesh.castShadow = true;
                meshes.push(mesh);
            });
        });
        setMeshes(meshes);
    }, [svg]);

    useEffect(() => {
        console.log("updating material");
        meshes.forEach((mesh) => {
            mesh.material = material;
        });
    }, [material]);

    return { meshes }
}