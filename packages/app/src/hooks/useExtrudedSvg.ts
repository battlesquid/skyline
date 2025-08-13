import { type MutableRefObject, useEffect, useState } from "react";
import { ExtrudeGeometry, type Group, Mesh, type MeshStandardMaterial, type Vector3 } from "three";
import { SVGLoader } from "three-stdlib";
import type { Dimensions } from "../three/utils";
import { getSvgBoundingBox, isNullish } from "../utils";
import { useBoundingBox } from "./useBoundingBox";

export interface UseExtrudedSvgOptions {
    svg: string | undefined;
    material: MeshStandardMaterial;
    depth?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    group?: MutableRefObject<Group | null>;
    onGroupReady?: (group: Group) => void;
}

const loader = new SVGLoader();

export type UseExtrudedSvgResult = [Mesh[], Dimensions, Vector3]

export const useExtrudedSvg = ({
    svg,
    material,
    depth = 3,
    castShadow = true,
    receiveShadow = false,
    group,
    onGroupReady
}: UseExtrudedSvgOptions): UseExtrudedSvgResult => {
    const [meshes, setMeshes] = useState<Mesh[]>([]);
    const [svgBoundingBox, setSvgBoundingBox] = useState<Dimensions>({ width: 0, height: 0 });

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
