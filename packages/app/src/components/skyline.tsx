import { useMantineTheme } from "@mantine/core";
import { Bounds, OrbitControls, Stage, Text3D } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ResultOf } from "gql.tada";
import { ContributionQuery } from "../api/query";
import { ContributionTower } from "./contribution_tower";

interface SkylineProps {
  user: string;
  year: string;
  weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
}

export function Skyline(props: SkylineProps) {
  const { user, weeks, year } = props;
  const theme = useMantineTheme();

  const length = weeks.length / 2;
  const width = 7 / 2;
  const padding = 1;
  const platform_height = 2;

  return (
    <Canvas style={{ backgroundColor: theme.colors.dark[8] }}>
      <Stage>
        <Bounds fit clip observe margin={1.2}>
          {weeks.map((week, i) =>
            week.contributionDays.map((day, j) => (
              <ContributionTower key={day.date.toString()} day={day} x={i / 2} y={j / 2} height={day.contributionCount * 0.1 + 0.1} />
            )),
          )}
          <mesh position={[13, 0 - platform_height / 2, 1.5]}>
            <boxGeometry args={[length + padding, platform_height, width + padding]} />
            {/* <meshStandardMaterial wireframe={true} /> */}
          </mesh>
          <Text3D
            font={"/Inter_Bold.json"}
            position={[0, 0 - platform_height / 2 - 0.5, 3.5]}
            letterSpacing={-0.1}
            lineHeight={3}
            height={0.5}
          >
            {user}
            <meshStandardMaterial color={"#302e86"} />
          </Text3D>
          <Text3D
            font={"/Inter_Bold.json"}
            position={[22, 0 - platform_height / 2 - 0.55, 3.5]}
            letterSpacing={-0.1}
            lineHeight={3}
            height={0.5}
          >
            {year}
            <meshStandardMaterial color={"#302e86"} />
          </Text3D>/
        </Bounds>
      </Stage>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
    </Canvas>
  );
}
