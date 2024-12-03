import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useQuery } from "urql";
import { ContributionQuery } from "./api/query";

export interface SkylineProps {

}

export const Skyline = (props: SkylineProps) => {
    const [result] = useQuery({
        query: ContributionQuery,
        variables: {
            name: "Battlesquid",
            start: "2023-01-01T00:00:00Z",
            end: "2023-12-31T00:00:00Z"
        }
    });

    useEffect(() => {
        console.log(result)
    }, [result])

    const ref = useRef<THREE.Mesh>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    useFrame((state, delta) => (ref.current.rotation.x += delta))
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    )
}
