import { useMantineTheme } from "@mantine/core";
import { Bounds, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SkylineModel, SkylineModelProps } from "./skyline_model";

export function Skyline(props: SkylineModelProps) {
  const { parameters, years } = props;
  const theme = useMantineTheme();

  return (
    <Canvas
      style={{ backgroundColor: theme.colors.dark[8] }}
      shadows
      camera={{ position: [0, 0, 10], zoom: 2 }}
    >
      {/* <Bounds fit clip observe> */}
        <SkylineModel parameters={parameters} years={years} />
      {/* </Bounds> */}
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[0, 20, 200]} angle={0.50} penumbra={0.1} decay={0.4} intensity={Math.PI} />
      <pointLight position={[0, 20, 0]} decay={0} intensity={Math.PI} />
      <directionalLight color="#fff" position={[0, 10, -50]} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI} />
    </Canvas>
  );
}
