import { Text3D, useFont } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BoxGeometry,
    type BufferGeometry,
    type Group,
    type Mesh,
    MeshStandardMaterial,
} from "three";
import type { ContributionWeeks } from "../api/types";
import { formatYearText } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useSvgMesh } from "../hooks/useSvgMesh";
import { LOGOS } from "../logos";
import { useParametersContext } from "../stores/parameters";
import { getSvgBoundingBox, safeString } from "../utils";
import { RectangularFrustumGeometry } from "./rectangular_frustum_geometry";
import { SkylineBaseShape } from "./types";
import { Base, Geometry, Subtraction } from "@react-three/csg";
import { extend, type Object3DNode } from "@react-three/fiber";
import { TextGeometry } from "three-stdlib";
import { getInsetTextGeometry } from "./inset_text";

extend({ TextGeometry })

// idea: thin mesh with text cut out, apply extrudegeom on it
// use csg to cut out slot from base
// place extruded mesh in the slot

declare module '@react-three/fiber' {
    interface ThreeElements {
        textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>
    }
}

export interface SkylineBaseProps {
    color: string;
    years: ContributionWeeks[];
}

export function SkylineBase({
    color,
    years
}: SkylineBaseProps) {
    const inputs = useParametersContext((state) => state.inputs);
    const computed = useParametersContext((state) => state.computed);

    const yearRef = useRef<Mesh | null>(null);
    const nameRef = useRef<Mesh | null>(null);

    const { size: yearBoundingBox } = useBoundingBox({
        obj: yearRef
    }, [inputs.name, inputs.startYear, inputs.endYear, inputs.font]);

    const { size: nameBoundingBox } = useBoundingBox({
        obj: nameRef
    }, [inputs.name, inputs.nameOverride, inputs.font]);

    const [geometry, setGeometry] = useState<BufferGeometry>(
        new BoxGeometry(0, 0, 0),
    );
    const [rot, setRot] = useState(0);

    useEffect(() => {
        const width = computed.modelLength + computed.paddingWidth;
        const length = computed.modelWidth * years.length + computed.paddingWidth;
        const height = computed.platformHeight;

        let geom: BufferGeometry;
        let newRot = 0;

        switch (inputs.shape) {
            case SkylineBaseShape.Prism:
                geom = new BoxGeometry(width, height, length);
                newRot = 0;
                break;
            case SkylineBaseShape.Frustum: {
                geom = new RectangularFrustumGeometry(width, length, height);
                newRot = (geom as RectangularFrustumGeometry).calculateSlopeAngle();
                console.log(newRot)
                break;
            }
        }
        setGeometry(geom);
        setRot(newRot);
    }, [inputs.shape, inputs.insetText, years, computed]);

    const logo = useRef<Group | null>(null);
    const material = useMemo(
        () =>
            new MeshStandardMaterial({
                color: inputs.showContributionColor
                    ? getDefaultParameters().inputs.color
                    : inputs.color,
            }),
        [inputs.color, inputs.showContributionColor],
    );

    const { meshes } = useSvgMesh(LOGOS.Circle, material);
    useEffect(() => {
        if (logo.current === null) {
            return;
        }
        logo.current.clear();
        for (const mesh of meshes) {
            logo.current?.add(mesh);
        }
        const wantedHeight = 0.65 * computed.platformHeight;
        const { height } = getSvgBoundingBox(LOGOS.Circle);

        const scale = wantedHeight / height;
        console.log(scale, height)
        logo.current.scale.set(scale, -scale, scale);
    }, [logo.current, meshes]);

    const { size: logoBoundingBox } = useBoundingBox(
        {
            obj: logo,
        },
        [logo.current, meshes],
    );
    const LOGO_Y_OFFSET = logoBoundingBox.y / 2;
    const LOGO_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : 0;
    const TEXT_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : -0.1;
    const BRUSH_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : 0;
    const font = useFont(inputs.font);
    const name = inputs.nameOverride.trim() !== "" ? inputs.nameOverride : inputs.name

    useEffect(() => {
        getInsetTextGeometry(name, inputs.font as string, computed.textSize)

    }, [name, inputs.font])

    const brushRef = useRef<BoxGeometry | null>(null);
    useEffect(() => {
        brushRef.current?.center();
    }, [inputs.shape]);

    return (
        <group>
            <group
                ref={logo}
                rotation={[rot, 0, 0]}
                position={[
                    -computed.xMidpointOffset + 5,
                    -computed.platformMidpoint + LOGO_Y_OFFSET,
                    (computed.modelWidth * years.length) / 2 +
                    inputs.padding +
                    LOGO_DEPTH_OFFSET,
                ]}
            />
            <Text3D
                visible={false}
                ref={nameRef}
                font={inputs.font}
                rotation={[rot, 0, 0]}
                receiveShadow
                castShadow
                position={[
                    -computed.xMidpointOffset + nameBoundingBox.x / 2 + 12,
                    -computed.platformMidpoint - 0.5,
                    (computed.modelWidth * years.length) / 2 +
                    inputs.padding +
                    TEXT_DEPTH_OFFSET,
                ]}
                height={inputs.textDepth}
                size={computed.textSize}
            >
                {inputs.nameOverride.trim() !== "" ? inputs.nameOverride : inputs.name}
                <meshStandardMaterial color={color} />
            </Text3D>
            <mesh
                onPointerEnter={(e) => e.stopPropagation()}
                position={[0, -computed.platformMidpoint, 0]}
            >
                <meshStandardMaterial flatShading color={color} />

                <Geometry showOperations>
                    <Base geometry={geometry} />
                    <Subtraction
                        rotation={[rot, 0, 0]}
                        position={[-computed.xMidpointOffset + nameBoundingBox.x / 2 + 12, -BRUSH_DEPTH_OFFSET, (computed.modelWidth * years.length) / 2 + (3 / 2 + BRUSH_DEPTH_OFFSET)]}
                    >
                        <boxGeometry ref={brushRef} args={[nameBoundingBox.x, nameBoundingBox.y, 3]} />
                        {/* <Text3D
                            ref={nameRef}
                            font={inputs.font}
                            rotation={[rot, 0, 0]}
                            receiveShadow
                            castShadow
                               position={[
                            -computed.xMidpointOffset + nameBoundingBox.x / 2 + 12,
                            ,
                            (computed.modelWidth * years.length) / 2,
                        ]}
                            height={inputs.textDepth}
                            size={computed.textSize}
                        >
                            {}
                        </Text3D> */}
                    </Subtraction>
                    {/* <Subtraction position={[
                        computed.xMidpointOffset - yearBoundingBox.x / 2 - 5,
                        -computed.platformMidpoint - 0.5,
                        (computed.modelWidth * years.length) / 2 +
                        computed.paddingWidth / 2 +
                        TEXT_DEPTH_OFFSET,
                    ]}>
                        <Text3D
                            ref={yearRef}
                            font={inputs.font}
                            receiveShadow
                            castShadow
                            rotation={[rot, 0, 0]}

                            height={inputs.textDepth}
                            size={computed.textSize}
                        >
                            {formatYearText(inputs.startYear, inputs.endYear)}
                        </Text3D>
                    </Subtraction> */}
                </Geometry>
                {/* 
                <mesh
                    
                    castShadow
                    receiveShadow
                    geometry={geometry}
                    position={[0, -computed.platformMidpoint, 0]}
                >
                    <meshStandardMaterial flatShading color={color} />
                </mesh> */}
            </mesh>
        </group>
    );
}
