import { Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";
import { marqueeClamp } from "../utils";
import { useParametersStore } from "../stores/parameters";

export interface GridEffectsProps {

}

const TRAILS = [
    {}
]

export function GridEffects(props: GridEffectsProps) {
    const parameters = useParametersStore(state => state.parameters);
    useFrame(({ clock, }) => {
        if (mesh.current === null) {
            return;
        }
        mesh.current.position.x = marqueeClamp(mesh.current.position.x + 1, -200, 200);
    });

    const mesh = useRef<Mesh | null>(null);

    return (
        <Trail
            width={100} // Width of the line
            color={'hotpink'} // Color of the line
            length={1} // Length of the line
            decay={1} // How fast the line fades away
            interval={1} // Number of frames to wait before next calculation
            attenuation={(width) => width} // A function to define the width in each point along it.
        >
            <mesh ref={mesh} position={[20, -parameters.computed.platformHeight, 20]}>
                <boxGeometry args={[1, 0, 0.5]} />
                <meshBasicMaterial color="white" />
            </mesh>
            {/* <meshLineMaterial color={"red"} />  */}
        </Trail>
    )
}