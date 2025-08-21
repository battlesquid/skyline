import { useFont } from "@react-three/drei";
import { useMemo, useRef } from "react";
import {
    type Group,
    MeshStandardMaterial
} from "three";
import { TextGeometry } from "three-stdlib";
import type { ContributionWeeks } from "../api/types";
import { useExtrudedSvg } from "../hooks/useExtrudedSvg";
import { toPolygons, useTTFLoader } from "../hooks/useTTFLoader";
import { LOGOS } from "../logos";
import { type ManifoldFrustumArgs, type ManifoldFrustumText, makeThreeFrustum } from "../manifold/frustum";
import { makeTextManifold } from "../manifold/utils";
import { useParametersContext } from "../stores/parameters";
import { SkylineBaseShape } from "./types";

export interface SkylineBaseProps {
    years: ContributionWeeks[];
}

export function SkylineBase({
    years
}: SkylineBaseProps) {
    const inputs = useParametersContext((state) => state.inputs);
    const computed = useParametersContext((state) => state.computed);
    const font = useFont(inputs.font)

    const nameGeometry = new TextGeometry(computed.resolvedName, {
        font,
        height: inputs.textDepth,
        size: computed.textSize
    });
    const yearGeometry = new TextGeometry(computed.formattedYear, {
        font,
        height: inputs.textDepth,
        size: computed.textSize
    });

    // TODO: dont memoize this, maybe make a hook to just update props
    const material = useMemo(
        () =>
            new MeshStandardMaterial({
                color: computed.renderColor,
                flatShading: true
            }),
        [computed.renderColor],
    );

    const logoRef = useRef<Group | null>(null);
    const logo = useExtrudedSvg({
        svg: LOGOS.Circle,
        ref: logoRef,
        depth: inputs.textDepth,
        material,
        onObjectReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / logo.svgBoundingBox.height;
            group.scale.set(scale, -scale, 1);
        },
    });

    const ttfFont = useTTFLoader("/fonts/ttf/Inter_Bold.ttf");

    const frustumProps: ManifoldFrustumArgs = useMemo(() => ({
        width: computed.modelLength + computed.paddingWidth,
        length: computed.modelWidth * years.length + computed.paddingWidth,
        height: computed.platformHeight,
        lengthPadding: 7 * +(inputs.shape === SkylineBaseShape.Frustum),
        widthPadding: 5 * +(inputs.shape === SkylineBaseShape.Frustum)
    }), [computed, years, inputs.shape]);

    const nameManifoldProps: ManifoldFrustumText = useMemo(() => ({
        text: makeTextManifold(nameGeometry),
        points: toPolygons(ttfFont, computed.resolvedName),
        offset: inputs.nameOffset
    }), [nameGeometry, inputs.nameOffset]);

    const yearManifoldProps: ManifoldFrustumText = useMemo(() => ({
        text: makeTextManifold(yearGeometry),
        points: toPolygons(ttfFont, computed.formattedYear),
        offset: inputs.yearOffset
    }), [yearGeometry, inputs.yearOffset]);

    const frustum = makeThreeFrustum(
        frustumProps,
        nameManifoldProps,
        yearManifoldProps,
        inputs.insetText
    );


    // TODO: if text depth becomes a configurable parameter, this check probably won't suffice
    // we'll instead need to subtract the bounding box of the base w/ text minus the base
    // in the case that text is extruded past the base's bounding box
    const TEXT_EXTRUSION_OFFSET = (inputs.insetText || inputs.shape === SkylineBaseShape.Frustum)
        ? 0
        : inputs.textDepth / 2;

    return (
        <>
            <mesh
                geometry={frustum.geometry}
                position={[0, -computed.halfPlatformHeight, TEXT_EXTRUSION_OFFSET]}
                material={material}
                onPointerOver={(e) => e.stopPropagation()}
                castShadow
                receiveShadow
            />
            <object3D
                ref={logoRef}
                rotation={[frustum.angle, 0, 0]}
                position={[
                    -computed.halfModelLength - inputs.padding + inputs.logoOffset - (frustum.normal.x * (logo.threeBoundingBox.z / 2)),
                    -computed.halfPlatformHeight + (frustum.normal.y * (logo.threeBoundingBox.z / 2)),
                    (computed.modelWidth * years.length / 2) + inputs.padding + (frustum.normal.z * (logo.threeBoundingBox.z / 2)) + (frustumProps.lengthPadding / 4)
                ]}
            />
        </>
    );
}
