import { Text3D } from "@react-three/drei";
import opentype from "opentype.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    type Group,
    type Mesh,
    MeshStandardMaterial
} from "three";
import type { ContributionWeeks } from "../api/types";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useExtrudedSvg } from "../hooks/useExtrudedSvg";
import { LOGOS } from "../logos";
import { emptyThreeFrustum, type ManifoldFrustumArgs, type ManifoldSlot, makeThreeFrustum } from "../manifold/frustum";
import { useParametersContext } from "../stores/parameters";
import { getInsetTextSvg } from "./inset_text";
import { SkylineBaseShape } from "./types";

export interface SkylineBaseProps {
    years: ContributionWeeks[];
}

export function SkylineBase({
    years
}: SkylineBaseProps) {
    const inputs = useParametersContext((state) => state.inputs);
    const computed = useParametersContext((state) => state.computed);

    const nameRef = useRef<Mesh | null>(null);
    const yearRef = useRef<Mesh | null>(null);

    const { size: nameBoundingBox } = useBoundingBox({
        obj: nameRef
    }, [computed.resolvedName, inputs.font]);

    const { size: yearBoundingBox } = useBoundingBox({
        obj: yearRef
    }, [inputs.name, inputs.startYear, inputs.endYear, inputs.font]);


    // TODO: dont memoize this, maybe make a hook to just update props
    const material = useMemo(
        () =>
            new MeshStandardMaterial({
                color: computed.renderColor,
                flatShading: true
            }),
        [computed.renderColor],
    );

    const fontRef = useRef<opentype.Font | null>(null);
    useEffect(() => {
        const loadFont = async () => {
            const response = await fetch(`/fonts/ttf/Inter_Bold.ttf`);
            const buffer = await response.arrayBuffer();
            const font = opentype.parse(buffer);
            fontRef.current = font;
        }
        loadFont();
    }, []);

    const logoRef = useRef<Group | null>(null);
    const logo = useExtrudedSvg({
        svg: LOGOS.Circle,
        ref: logoRef,
        material,
        onObjectReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / logo.svgBoundingBox.height;
            group.scale.set(scale, -scale, 1);
        },
    });

    const insetNameRef = useRef<Group | null>(null);
    const nameExtrusion = useExtrudedSvg({
        svg: getInsetTextSvg(computed.resolvedName, fontRef.current, computed.textSize * 2),
        ref: insetNameRef,
        material,
        depth: inputs.insetDepth,
        onObjectReady(obj) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / nameExtrusion.svgBoundingBox.height;
            obj.scale.set(scale, -scale, 1);
        },
    });

    const insetYearRef = useRef<Group | null>(null);
    const yearExtrusion = useExtrudedSvg({
        svg: getInsetTextSvg(computed.formattedYear, fontRef.current, computed.textSize * 2),
        ref: insetYearRef,
        material,
        depth: inputs.insetDepth,
        onObjectReady(obj) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / yearExtrusion.svgBoundingBox.height;
            obj.scale.set(scale, -scale, 1);
        },
    });

    const frustumProps: ManifoldFrustumArgs = useMemo(() => ({
        width: computed.modelLength + computed.paddingWidth,
        length: computed.modelWidth * years.length + computed.paddingWidth,
        height: computed.platformHeight,
        lengthPadding: 7 * +(inputs.shape === SkylineBaseShape.Frustum),
        widthPadding: 5 * +(inputs.shape === SkylineBaseShape.Frustum)
    }), [computed, years, inputs.shape]);

    const NORMAL_TRANSLATION = {
        LOGO: logo.threeBoundingBox.z / 2,
        NAME: -nameExtrusion.threeBoundingBox.z / 2,
        YEAR: -yearExtrusion.threeBoundingBox.z / 2
    }

    const [frustum, setFrustum] = useState(emptyThreeFrustum());
    useEffect(() => {
        const nameSlotProps: ManifoldSlot = {
            width: inputs.insetText ? nameExtrusion.threeBoundingBox.x : 0,
            length: inputs.insetText ? nameExtrusion.threeBoundingBox.z : 0,
            height: inputs.insetText ? nameExtrusion.threeBoundingBox.y : 0,
            offset: inputs.nameOffset
        };
        const yearSlotProps: ManifoldSlot = {
            width: inputs.insetText ? yearExtrusion.threeBoundingBox.x : 0,
            length: inputs.insetText ? yearExtrusion.threeBoundingBox.z : 0,
            height: inputs.insetText ? yearExtrusion.threeBoundingBox.y : 0,
            offset: inputs.yearOffset
        };
        setFrustum(makeThreeFrustum(frustumProps, nameSlotProps, yearSlotProps));
    }, [inputs.insetText, inputs.nameOffset, inputs.yearOffset, frustumProps, nameExtrusion.threeBoundingBox, yearExtrusion.threeBoundingBox]);

    const name3D = inputs.insetText
        ? (
            <object3D
                ref={insetNameRef}
                rotation={[frustum.angle, 0, 0]}
                position={[
                    -computed.halfModelLength - inputs.padding + inputs.nameOffset - (frustum.normal.x * NORMAL_TRANSLATION.NAME) + nameExtrusion.threeBoundingBox.x / 2,
                    -computed.halfPlatformHeight + (frustum.normal.y * NORMAL_TRANSLATION.NAME),
                    (computed.modelWidth * years.length / 2) + inputs.padding + (frustum.normal.z * NORMAL_TRANSLATION.NAME) + (frustumProps.lengthPadding / 4)
                ]}
            />
        )
        : (
            <Text3D
                ref={nameRef}
                font={inputs.font}
                rotation={[frustum.angle, 0, 0]}
                material={material}
                position={[
                    -computed.halfModelLength - inputs.padding + inputs.nameOffset - (frustum.normal.x * NORMAL_TRANSLATION.NAME) + nameBoundingBox.x / 2,
                    -computed.halfPlatformHeight + (frustum.normal.y * NORMAL_TRANSLATION.NAME),
                    (computed.modelWidth * years.length / 2) + inputs.padding + (frustum.normal.z * NORMAL_TRANSLATION.NAME) + (frustumProps.lengthPadding / 4)
                ]}
                height={inputs.textDepth}
                size={computed.textSize}
                receiveShadow
                castShadow
            >
                {computed.resolvedName}
            </Text3D>
        );

    const year3D = inputs.insetText
        ? (
            <object3D
                ref={insetYearRef}
                rotation={[frustum.angle, 0, 0]}
                position={[
                    computed.halfModelLength + inputs.padding - (yearExtrusion.threeBoundingBox.x / 2) - inputs.yearOffset,
                    -computed.halfPlatformHeight + (frustum.normal.y * NORMAL_TRANSLATION.YEAR),
                    (computed.modelWidth * years.length / 2) + inputs.padding + (frustum.normal.z * NORMAL_TRANSLATION.YEAR) + (frustumProps.lengthPadding / 4)
                ]}
            />
        )
        : (
            <Text3D
                ref={yearRef}
                font={inputs.font}
                rotation={[frustum.angle, 0, 0]}
                material={material}
                position={[
                    computed.halfModelLength + inputs.padding - (yearBoundingBox.x / 2) - inputs.yearOffset,
                    -computed.halfPlatformHeight + (frustum.normal.y * NORMAL_TRANSLATION.YEAR),
                    (computed.modelWidth * years.length / 2) + inputs.padding + (frustum.normal.z * NORMAL_TRANSLATION.YEAR) + (frustumProps.lengthPadding / 4)
                ]}
                height={inputs.textDepth}
                size={computed.textSize}
                receiveShadow
                castShadow
            >
                {computed.formattedYear}
            </Text3D>
        );


    return (
        <>
            <mesh
                geometry={frustum.geometry}
                position={[0, -computed.halfPlatformHeight, 0]}
                material={material}
            />
            <object3D
                ref={logoRef}
                rotation={[frustum.angle, 0, 0]}
                position={[
                    -computed.halfModelLength - inputs.padding + inputs.logoOffset - (frustum.normal.x * NORMAL_TRANSLATION.LOGO),
                    -computed.halfPlatformHeight + (frustum.normal.y * NORMAL_TRANSLATION.LOGO),
                    (computed.modelWidth * years.length / 2) + inputs.padding + (frustum.normal.z * NORMAL_TRANSLATION.LOGO) + (frustumProps.lengthPadding / 4)
                ]}
            />
            {name3D}
            {year3D}
        </>
    );
}
