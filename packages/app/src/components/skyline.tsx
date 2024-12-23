import { useMantineTheme } from "@mantine/core";
import { Bounds, Environment, GizmoHelper, GizmoViewport, Helper, OrbitControls, Sky, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SkylineModel, SkylineModelProps } from "./skyline_model";
import { DirectionalLightHelper, PointLightHelper, SpotLightHelper } from "three";

export function Skyline(props: SkylineModelProps) {
  const { parameters, weeks } = props;
  const theme = useMantineTheme();

  return (
    <Canvas
      style={{ backgroundColor: theme.colors.dark[8] }}
      shadows
      camera={{ position: [0, Math.PI / 2.5, 10], zoom: 2 }}
    >
      <Bounds observe margin={1.2}>
        <SkylineModel parameters={parameters} weeks={weeks} />
      </Bounds>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[0, 50, 0]} angle={0.50} penumbra={0.1} decay={0.4} intensity={Math.PI / 2} >
        {/* <Helper type={SpotLightHelper} /> */}
      </spotLight>
      <hemisphereLight color={"#6d70cf"} />
      <pointLight position={[0, 10, 0]} decay={0} intensity={Math.PI} >
        {/* <Helper type={PointLightHelper} /> */}
      </pointLight>
      <directionalLight color="#fff" position={[0, 10, 10]} >
        {/* <Helper type={DirectionalLightHelper} /> */}
      </directionalLight>
      <GizmoHelper alignment="bottom-right" margin={[80, 80]} >
        <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
      </GizmoHelper>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} minZoom={0.5} />
    </Canvas>
  );
}
