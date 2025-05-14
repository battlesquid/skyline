import { useMantineTheme } from "@mantine/core";
import { Bounds, Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";
import { SkylineModel, SkylineModelProps } from "./skyline_model";

export type SkylineProps = Omit<SkylineModelProps, "group">

export function Skyline(props: SkylineProps) {
  const { parameters, years } = props;
  const theme = useMantineTheme();
  const group = useRef<Group>(null!);

  return (
    <Canvas
      style={{ backgroundColor: theme.colors.dark[8] }}
      shadows
      camera={{ position: [0, 0, 10], zoom: 1.5, fov: 10 }}
    >
      <Bounds fit clip observe>
        <SkylineModel group={group} parameters={parameters} years={years} />
      </Bounds>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight castShadow position={[0, 20, 200]} angle={0.50} penumbra={0.1} decay={0.4} intensity={Math.PI} />
      <pointLight castShadow position={[0, 40, 50]} decay={0} intensity={Math.PI} />
      <directionalLight color="#fff" position={[0, 10, -50]} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI} />
      <Environment preset="forest" />
      <Grid
        position={[0, -(parameters.towerSize * 3), 0]}
        cellSize={0}
        sectionColor={"#555"}
        sectionSize={40}
        fadeDistance={10000}
        fadeStrength={10}
        fadeFrom={1}
        infiniteGrid={true}
      />
    </Canvas>
  );
}
