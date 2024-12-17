import { useMantineTheme } from "@mantine/core";
import { Bounds, OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ResultOf } from "gql.tada";
import { ContributionQuery } from "../../api/query";
import { SkylineModel } from "./skyline_model";

export interface SkylineProps {
  user: string;
  year: string;
  weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
}

export function Skyline(props: SkylineProps) {
  const { user, weeks, year } = props;
  const theme = useMantineTheme();

  return (
    <Canvas
      style={{ backgroundColor: theme.colors.dark[8] }}
      shadows
      camera={{ position: [0, 0, 10], zoom: 2 }}
    >
      <Stage>
        <Bounds fit clip observe>
          <SkylineModel user={user} year={year} weeks={weeks} />
        </Bounds>
        <directionalLight color="#fff" position={[13, 100, 100]} />
      </Stage>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
    </Canvas>
  );
}
