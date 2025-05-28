import { Bounds, Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas, RenderProps } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group } from "three";
import { SkylineModel, SkylineModelProps } from "./skyline_model";
import { useParametersStore } from "../stores";

export type SkylineProps = Omit<SkylineModelProps, "group">

export function Skyline(props: SkylineProps) {
  const { years } = props;
  const { parameters } = useParametersStore();
  const group = useRef<Group>(null!);
  const style = useMemo(() => ({}), []);
  const camera = useMemo<RenderProps<HTMLCanvasElement>["camera"]>(() => ({ position: [0, 0, 10], fov: 10 }), []);

  return (
    <Canvas
      style={style}
      camera={camera}
      shadows
    >
      <Bounds fit clip observe margin={1}>
        <SkylineModel group={group} years={years} />
      </Bounds>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight castShadow position={[0, 20, 200]} angle={0.50} penumbra={0.1} decay={0.4} intensity={Math.PI} />
      <pointLight castShadow position={[0, 40, 50]} decay={0} intensity={Math.PI} />
      <directionalLight color="#fff" position={[0, 10, -50]} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI} />
      <Environment preset="forest" />
      <Grid
        name="grid"
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
