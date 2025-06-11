import { useEffect, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, FrontSide, type Mesh } from "three";
import { type Dimensions, getDimensions } from "./utils";
import { useParametersStore } from "../stores";
import type { ContributionWeeks } from "../api/types";
import { Text3D } from "@react-three/drei";
import { formatYearText } from "../api/utils";
import { ModalBaseHeader } from "@mantine/core";

export interface RectangularFrustumProps {
    width: number;
    length: number;
    height: number;
    color: string;
    years: ContributionWeeks[];
}

export function RectangularFrustum(props: RectangularFrustumProps) {
    const { parameters } = useParametersStore();

    const topWidth = props.width;
    const topLength = props.length; // base width/height
    const baseWidth = props.width + 5;
    const baseLength = props.length + 10; // top width/height
    const mesh = useRef<Mesh | null>(null)

    const vertices = new Float32Array([
        // bottom
        -baseWidth / 2, -props.height, -baseLength / 2, // 0 bottom back-left
        baseWidth / 2, -props.height, -baseLength / 2, // 1 bottom back-right
        baseWidth / 2, -props.height, baseLength / 2, // 2 bottom front-right
        -baseWidth / 2, -props.height, baseLength / 2, // 3 bottom front-left

        // top
        -topWidth / 2, 0, -topLength / 2, // 4: top back-left
        topWidth / 2, 0, -topLength / 2,  // 5: top back-right
        topWidth / 2, 0, topLength / 2,  // 6:  top front-right
        -topWidth / 2, 0, topLength / 2, // 7:  top front-left
    ]);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    const indices = [
        // Sides (CCW from outside)
        1, 0, 5, 
        5, 0, 4, // back

        2, 1, 6, 
        6, 1, 5, // right


        3, 2, 7, 
        7, 2, 6, // front

        0, 3, 4, 
        4, 3, 7, // left

        // Base (flip triangle order to face downward)
        0, 1, 2, 
        0, 2, 3,

        // Top
        4, 6, 5, 
        4, 7, 6
    ];

    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    // geometry.center();


    const yearRef = useRef<Mesh | null>(null);
    const nameRef = useRef<Mesh | null>(null);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({
        width: 0,
        height: 0,
    });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({
        width: 0,
        height: 0,
    });
    useEffect(() => {
        if (nameRef.current === null || yearRef.current === null) {
            return;
        }
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [
        parameters.name,
        parameters.startYear,
        parameters.endYear,
        parameters.font,
        props.years,
    ]);

    const centerX = -(topWidth + baseWidth) / 4; // midpoint of near and far left x positions
const centerY = 0;
const centerZ = props.height / 2;

// Compute tilt angle between near and far planes on the x-axis
const angleX = Math.atan2(baseLength, topLength); // tilt in Z-X plane


    return (
        <>
        
           <Text3D
                ref={nameRef}
                font={parameters.font}
                  rotation={[angleX, 0, 0]}
                receiveShadow
                castShadow
                position={[
                    -props.width / 2 + nameDimensions.width / 2 + 12,
                    -props.height / 2 - 0.5,
                    (props.length * props.years.length) / 2 + parameters.padding - 0.1,
                ]}
                height={parameters.textDepth}
                size={props.height / 2.2}
            >
                {parameters.name}
                <meshStandardMaterial color={props.color} />
            </Text3D>
            <Text3D
                ref={yearRef}
                font={parameters.font}
                receiveShadow
                castShadow
                position={[
                    props.width / 2 - yearDimensions.width / 2 - 5,
                    -props.height / 2 - 0.5,
                    (props.length * props.years.length) / 2 + parameters.padding - 0.1,
                ]}
                height={parameters.textDepth}
                size={props.height / 2.2}
            >
                {formatYearText(parameters.startYear, parameters.endYear)}
                <meshStandardMaterial color={props.color} />
            </Text3D>
        <mesh ref={mesh} castShadow receiveShadow geometry={geometry}>
            <meshStandardMaterial flatShading side={FrontSide} color={props.color} />
        </mesh>
        </>
    )
}

// export function RectangularFrustum({
//     width,
//     length,
//     height,
//     color = "orange",
//     ...props
// }: RectangularFrustumProps) {
//     // By default, top face is half the size of the base
//     const tw = width;
//     const tl = length;
//     const mesh = useRef<Mesh | null>(null)

//     // Base center at (0,0,0), top face at y=height
//     const geometry = useMemo(() => {
//         const hw = width / 2
//         const hl = length / 2;
//         const htw = tw / 2
//         const htl = tl / 2;

//         // 8 vertices (bottom 0-3, top 4-7)
//         const vertices = [
//             // Bottom face (y=0)
//             -hw, 0, -hl, // 0: bottom left near
//             hw, 0, -hl,  // 1: bottom right near
//             hw, 0, hl,   // 2: bottom right far
//             -hw, 0, hl,  // 3: bottom left far
//             // Top face (y=height)
//             -htw, height, -htl, // 4: top left near
//             htw, height, -htl,  // 5: top right near
//             htw, height, htl,   // 6: top right far
//             -htw, height, htl   // 7: top left far
//         ];

//         // Indices (two triangles per face, 6 faces)
//         const indices = [
//             // Bottom
//             2, 0, 1,
//             3, 0, 2,
//             // Top
//             5, 4, 6,
//             6, 4, 7,
//             // Sides
//             1, 0, 5,
//             5, 0, 4,

//             2, 1, 6,
//             6, 1, 5,

//             3, 2, 7,
//             7, 2, 6,

//             0, 3, 4,
//             4, 3, 7
//         ];

//         const geometry = new BufferGeometry();
//         geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
//         geometry.setIndex(new Uint16BufferAttribute(indices, 1));
//         geometry.computeVertexNormals();
//         return geometry;
//     }, [width, length, height, tw, tl]);
    
//     const scene = useThree(state => state.scene);
//     useEffect(() => {
//         if (mesh.current !== null) {
//             const helper = new VertexNormalsHelper(mesh.current, 1, 0xff0000);
//             scene.add(helper);
//         }
//     }, [mesh.current])

//     return (
//         <mesh ref={mesh} geometry={geometry} {...props}>

//             <meshStandardMaterial wireframe={false} side={FrontSide} flatShading color={color} />
//         </mesh>
//     );
// }