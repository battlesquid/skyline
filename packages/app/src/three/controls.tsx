import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useControlsStore } from "../stores/controls";

export function CameraControls() {
    const camera = useThree(state => state.camera);
    const gl = useThree(state => state.gl);
    const autoRotate = useControlsStore(state => state.autoRotate);

    return (
        <OrbitControls
            args={[camera, gl.domElement]}
            autoRotate={autoRotate}
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
        />
    );
}