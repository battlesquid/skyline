import { Billboard, CameraControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ResultOf } from "gql.tada";
import { ContributionQuery } from "../api/query";
import { ContributionTower } from "./contribution_tower";
import { useMantineTheme } from "@mantine/core";

interface SkylineProps {
    weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"]
}

export function Skyline(props: SkylineProps) {
    const { weeks } = props;
    const theme = useMantineTheme();

    return (
        <Canvas style={{ backgroundColor: theme.colors.dark[8] }}>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <CameraControls />
            <Billboard
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false} // Lock the rotation on the z axis (default=false)
            >
                <Text fontSize={1}>I'm a billboard</Text>
            </Billboard>
            {weeks.map((week, i) => (
                week.contributionDays.map((day, j) => (
                    <ContributionTower key={day.date.toString()} x={i - 26} y={j - 3.5} height={day.contributionCount * 0.2 + 0.2} />
                ))
            ))}
        </Canvas>
    )
}
