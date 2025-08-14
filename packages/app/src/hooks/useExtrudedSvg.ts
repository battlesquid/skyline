import { type MutableRefObject, useEffect, useState } from "react";
import { Box3, BufferGeometry, ExtrudeGeometry, type Group, Mesh, type MeshStandardMaterial, Object3D, Vector3 } from "three";
import { SVGLoader } from "three-stdlib";
import { getBoundingBoxVolume, type Dimensions } from "../three/utils";
import { getSvgBoundingBox, isNullish } from "../utils";
import { useBoundingBox } from "./useBoundingBox";

export interface UseExtrudedSvgOptions {
    svg: string | undefined;
    material: MeshStandardMaterial;
    depth?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    object?: MutableRefObject<Object3D | null>;
    onObjectReady?: (group: Object3D) => void;
}

const loader = new SVGLoader();

export type UseExtrudedSvgResult = [Mesh[], Dimensions, Vector3]

export interface GeometryBB {
    boundingBox: Box3;
    geometry: BufferGeometry;
}

export const useExtrudedSvg = ({
    svg,
    material,
    depth = 3,
    castShadow = true,
    receiveShadow = false,
    object: group,
    onObjectReady: onGroupReady
}: UseExtrudedSvgOptions): UseExtrudedSvgResult => {
    const [meshes, setMeshes] = useState<Mesh[]>([]);
    const [svgBoundingBox, setSvgBoundingBox] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        if (svg === undefined) {
            return;
        }
        const meshes: Mesh[] = [];
        const data = loader.parse(svg);
        const geometries: GeometryBB[] = []
        for (const path of data.paths) {
            const shapes = path.toShapes(true);
            for (const shape of shapes) {
                const geometry = new ExtrudeGeometry(shape, {
                    depth,
                    bevelEnabled: false,
                    bevelThickness: 0
                });
                geometry.computeBoundingBox();
                geometries.push({
                    boundingBox: geometry.boundingBox as Box3,
                    geometry
                });
            }
        }

        geometries.sort((g1, g2) => getBoundingBoxVolume(g2.boundingBox) - getBoundingBoxVolume(g1.boundingBox));

        const offset = new Vector3();
        for (let i = 0; i < geometries.length; i++) {
            const { geometry, boundingBox } = geometries[i];
            if (i === 0) {
                boundingBox.getCenter(offset).negate();
                geometry.center();
            } else {
                geometry.translate(offset.x, offset.y, offset.z)
            }
            const mesh = new Mesh(geometry, material);
            mesh.castShadow = castShadow;
            mesh.receiveShadow = receiveShadow;
            meshes.push(mesh);
        }
        setMeshes(meshes);
        setSvgBoundingBox(getSvgBoundingBox(svg));
    }, [svg, depth, castShadow, receiveShadow]);

    useEffect(() => {
        if (!isNullish(group) && !isNullish(group.current) && !isNullish(onGroupReady)) {
            group.current.clear();
            for (const mesh of meshes) {
                group.current.add(mesh);
            }
            onGroupReady(group.current);
        }
    }, [meshes, group, onGroupReady]);

    useEffect(() => {
        for (const mesh of meshes) {
            mesh.material = material;
        }
    }, [meshes, material]);

    const { size: threeBoundingBox } = useBoundingBox({
        obj: group
    }, [meshes]);

    return [meshes, svgBoundingBox, threeBoundingBox];
};
