import { Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { ResultOf } from "gql.tada";
import { useEffect } from "react";
import { ContributionQuery } from "../api/query";
import { defaults, SkylineModelParameters } from "../parameters";
import { useSceneStore } from "../scene";
import { ContributionTower } from "./contribution_tower";

export interface SkylineModelProps {
    parameters: SkylineModelParameters;
    weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
}

export function SkylineModel(props: SkylineModelProps) {
    const { parameters, weeks } = props;
    const length = weeks.length * parameters.towerSize;
    const width = 7 * parameters.towerSize;
    const platformHeight = parameters.towerSize * 3;
    const textSize = platformHeight / 2;
    const scene = useThree((state) => state.scene);
    const sceneStore = useSceneStore();

    const bounds = useBounds();
    let boundsTimeout: NodeJS.Timeout | undefined = undefined;
    useEffect(() => {
        if (boundsTimeout !== undefined) {
            clearTimeout(boundsTimeout)
        }
        sceneStore.setDirty(true);
        boundsTimeout = setTimeout(() => {
            sceneStore.setScene(scene.clone());
            bounds.refresh().clip().fit();
            sceneStore.setDirty(false);
        }, 1500);

        return () => {
            if (boundsTimeout !== undefined) {
                clearTimeout(boundsTimeout)
            }
        }
    }, [props.parameters.towerSize, props.parameters.towerDampening, props.parameters.name, props.parameters.year, props.parameters.padding]);

    return (
        <group>
            {weeks.map((week, i) =>
                week.contributionDays.map((day, j) => (
                    <ContributionTower
                        key={day.date.toString()}
                        day={day}
                        x={i * parameters.towerSize - length / 2 + parameters.towerSize / 2}
                        y={j * parameters.towerSize - width / 2 + parameters.towerSize / 2}
                        height={day.contributionCount * parameters.towerSize / parameters.towerDampening + parameters.towerSize / parameters.towerDampening}
                        size={parameters.towerSize}
                        defaultColor={parameters.color}
                        showContributionColor={parameters.showContributionColor}
                    />
                ))
            )}
            <mesh position={[0, 0 - platformHeight / 2, 0]}>
                <boxGeometry args={[length + parameters.padding * 2, platformHeight, width + parameters.padding * 2]} />
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </mesh>
            <Text3D
                font={parameters.font}
                position={[0 - length / 2 + 1, -platformHeight + textSize / 2, (width / 2) + parameters.padding]}
                letterSpacing={-0.1}
                height={parameters.textDepth}
                size={textSize}
            >
                {parameters.name}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
            <Text3D
                font={parameters.font}
                position={[length / 2 - 4, -platformHeight + textSize / 2, (width / 2) + parameters.padding]}
                letterSpacing={-0.1}
                height={parameters.textDepth}
                size={textSize}
            >
                {parameters.year}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
        </group>
    )
} 