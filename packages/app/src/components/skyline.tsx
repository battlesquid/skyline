import { useMantineTheme } from "@mantine/core";
import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ResultOf } from "gql.tada";
import { ContributionQuery } from "../api/query";
import { ContributionTower } from "./contribution_tower";
import { PerspectiveCamera } from "three";

interface SkylineProps {
  weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
}

export function Skyline(props: SkylineProps) {
  const { weeks } = props;
  const theme = useMantineTheme();

  const camera = new PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.y = 20
  camera.position.z = 30

  return (
    <Canvas camera={camera} style={{ backgroundColor: theme.colors.dark[8] }}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 60, 10]} angle={0.25} penumbra={1} decay={0} intensity={Math.PI / 2} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <CameraControls camera={camera}/>
      {weeks.map((week, i) =>
        week.contributionDays.map((day, j) => (
          <ContributionTower key={day.date.toString()} day={day} x={i - 26} y={j - 3.5} height={day.contributionCount * 0.2 + 0.2} />
        )),
      )}
    </Canvas>
  );
}
