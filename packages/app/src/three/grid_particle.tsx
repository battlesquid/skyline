import { Instance, Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { useParametersStore } from "../stores/parameters";
import { marqueeClamp } from "../utils";

export interface GridParticleProps {
    x: number;
    z: number;
    axis: "x" | "z";
}

export function GridParticle(props: GridParticleProps) {
    const { x, z: y, axis } = props;
    const ref = useRef<Mesh | null>(null);
    const parameters = useParametersStore(state => state.parameters);
    useFrame(() => {
        if (ref.current === null) {
            return;
        }
        ref.current
        ref.current.position[axis] = marqueeClamp(ref.current.position[axis] + 1, -200, 200)
    })
    return (
        <Trail
        
            width={100} // Width of the line
            color={'#ff3b8c'} // Color of the line
            length={5} // Length of the line
            decay={1} // How fast the line fades away
            interval={1} // Number of frames to wait before next calculation
            attenuation={(width) => width} // A function to define the width in each point along it.
        >
            <Instance
                ref={ref}
                position={[x, -parameters.computed.platformHeight, y]}
            />
        </Trail>
    );
}
