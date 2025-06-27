import { Instances } from "@react-three/drei";
import { useRef } from "react";
import { InstancedMesh } from "three";
import { useParametersStore } from "../stores/parameters";
import { GridParticle, GridParticleProps } from "./grid_particle";

const TRAILS: GridParticleProps[] = [
    // Z-axis trails (moving along z-direction)
    {
        x: -160,
        z: -100,
        axis: "z"
    },
    {
        x: -120,
        z: 60,
        axis: "z"
    },
    {
        x: -80,
        z: -140,
        axis: "z"
    },
    {
        x: -40,
        z: 80,
        axis: "z"
    },
    {
        x: 0,
        z: -40,
        axis: "z"
    },
    {
        x: 40,
        z: 120,
        axis: "z"
    },
    {
        x: 80,
        z: -80,
        axis: "z"
    },
    {
        x: 120,
        z: 20,
        axis: "z"
    },
    {
        x: 160,
        z: -160,
        axis: "z"
    },
    {
        x: 200,
        z: 100,
        axis: "z"
    },
    
    // X-axis trails (moving along x-direction)
    {
        x: -180,
        z: -120,
        axis: "x"
    },
    {
        x: 60,
        z: -160,
        axis: "x"
    },
    {
        x: -100,
        z: -80,
        axis: "x"
    },
    {
        x: 140,
        z: -40,
        axis: "x"
    },
    {
        x: -60,
        z: 0,
        axis: "x"
    },
    {
        x: 180,
        z: 40,
        axis: "x"
    },
    {
        x: -20,
        z: 80,
        axis: "x"
    },
    {
        x: 100,
        z: 120,
        axis: "x"
    },
    {
        x: -140,
        z: 160,
        axis: "x"
    },
    {
        x: 20,
        z: 200,
        axis: "x"
    },
    
    // Additional scattered trails for more coverage
    {
        x: -100,
        z: -20,
        axis: "z"
    },
    {
        x: 60,
        z: -120,
        axis: "z"
    },
    {
        x: -20,
        z: 140,
        axis: "z"
    },
    {
        x: 140,
        z: -60,
        axis: "z"
    },
    {
        x: -180,
        z: 180,
        axis: "x"
    },
    {
        x: 80,
        z: -100,
        axis: "x"
    },
    {
        x: -40,
        z: 60,
        axis: "x"
    },
    {
        x: 160,
        z: 180,
        axis: "x"
    }
]


export function GridEffects() {
    const parameters = useParametersStore(state => state.parameters);
    const mesh = useRef<InstancedMesh | null>(null);

    return (
        <Instances>
            <boxGeometry args={[1, 0, 0.5]} />
            <meshStandardMaterial />
            {TRAILS.map((t, i) => (
                <GridParticle key={i} x={t.x} z={t.z} axis={t.axis} />
            ))}
        </Instances>
    )

    // return (
    //     <Trail
    //         width={100} // Width of the line
    //         color={'hotpink'} // Color of the line
    //         length={1} // Length of the line
    //         decay={1} // How fast the line fades away
    //         interval={1} // Number of frames to wait before next calculation
    //         attenuation={(width) => width} // A function to define the width in each point along it.
    //     >
    //         <instancedMesh ref={mesh}>
    //             <boxGeometry args={[50, 5, 5]} />
    //             <meshBasicMaterial color="white" />
    //         </instancedMesh>
    //         {/* <mesh ref={mesh} position={[20, -parameters.computed.platformHeight, 20]}>
    //         </mesh>
    //         <meshLineMaterial color={"red"} />  */}
    //     </Trail>
    // )
}