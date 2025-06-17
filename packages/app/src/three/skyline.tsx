import { useMantineTheme } from "@mantine/core";
import {
    Bounds,
    Environment,
    Grid,
    OrbitControls,
    Sky
} from "@react-three/drei";
import { Canvas, type RenderProps } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three";
import { useParametersStore } from "../stores/parameters";
import { SkylineModel, type SkylineModelProps } from "./skyline_model";
import { GridEffects } from "./grid_effects";

export type SkylineProps = Omit<SkylineModelProps, "group">;

export function Skyline(props: SkylineProps) {
    const { years } = props;
    const { parameters } = useParametersStore();
    const group = useRef<Group | null>(null);
    const style = useMemo(() => ({}), []);
    const camera = useMemo<RenderProps<HTMLCanvasElement>["camera"]>(
        () => ({ position: [0, 0, 10], fov: 10, }),
        [],
    );
    const theme = useMantineTheme();

    return (
        <Canvas style={style} camera={camera} shadows>
            <color attach="background" args={["#120727"]} />
            <Bounds fit clip margin={1}>
                <SkylineModel group={group} years={years} />
            </Bounds>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight
                castShadow
                position={[0, 20, 200]}
                angle={0.5}
                penumbra={0.1}
                decay={0.4}
                intensity={Math.PI}
            />
            <pointLight
                castShadow
                position={[0, 40, 50]}
                decay={0}
                intensity={Math.PI}
            />
            <pointLight
                color={"#c734c4"}
                castShadow
                position={[0, 40, 0]}
                decay={0}
                intensity={Math.PI}
            />
            <directionalLight color="#3077cf" position={[0, 10, -50]} />
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI} />
            <Environment
                preset="forest"
            />
            <Grid
                side={DoubleSide}
                name="grid"
                position={[0, -parameters.computed.platformHeight, 0]}
                cellSize={0}
                sectionColor={"#525380"}
                sectionSize={20}
                fadeDistance={1000}
                fadeStrength={1}
                fadeFrom={1}
                infiniteGrid={true}
            />
            <GridEffects />
        </Canvas>
    );
}
