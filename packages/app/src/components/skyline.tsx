import { useMantineTheme } from "@mantine/core";
import { Bounds, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SkylineModel, SkylineModelProps } from "./skyline_model";

export function Skyline(props: SkylineModelProps) {
  const { parameters, weeks } = props;
  const theme = useMantineTheme();

  return (
    <Canvas
      style={{ backgroundColor: theme.colors.dark[8] }}
      shadows
      camera={{ position: [0, 0, 10], zoom: 2 }}
    >
      <Bounds fit clip observe>
        <SkylineModel parameters={parameters} weeks={weeks} />
      </Bounds>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 100, 40]} angle={0.55} penumbra={0.1} decay={0.4} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <directionalLight color="#fff" position={[13, 100, 100]} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
