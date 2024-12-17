import { Center, Text3D, useBounds } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { ResultOf } from "gql.tada";
import { useEffect, useRef, useState } from "react";
import { Group } from "three";
import { ContributionQuery } from "../../api/query";
import { SkylineModelParameters } from "../../App";
import { useSceneStore } from "../../scene";
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

    const [usingControls, setUsingControls] = useState(false);
    const group = useRef<Group>(null!);


    const bounds = useBounds();
    let boundsTimeout: NodeJS.Timeout | undefined = undefined;
    useEffect(() => {
        if (boundsTimeout !== undefined) {
            clearTimeout(boundsTimeout)
        }
        boundsTimeout = setTimeout(() => {
            bounds.refresh().clip().fit();
        }, 2000);

        return () => {
            if (boundsTimeout !== undefined) {
                clearTimeout(boundsTimeout)
            }
        }
    }, [props.parameters.towerSize, props.parameters.towerDampening])

    useFrame((state, delta) => (group.current.rotation.y += 0.001))
    // useEffect(() => {
    //     setInterval(() => {
    //         sceneStore.setScene(scene.clone());
    //     }, 1000)
    // }, [])
    // useEffect(() => {

    //     setInterval(() => {
    //         const exporter = new STLExporter();
    //         const clone = scene.clone();
    //         clone.rotation.set(Math.PI / 2, 0, 0);
    //         clone.updateMatrixWorld();
    //     }, 1000 * 5);
    // }, [])

    return (
        <group ref={group}>
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
                <meshStandardMaterial color={parameters.color} />
            </mesh>
            <Text3D
                font={parameters.font}
                position={[0 - length / 2 + 1, -platformHeight + textSize / 2, (width / 2) + parameters.padding]}
                letterSpacing={-0.1}
                height={parameters.textDepth}
                size={textSize}
            >
                {parameters.name}
                <meshStandardMaterial color={parameters.color} />
            </Text3D>
            <Center disableZ disableY>
                <Text3D
                    font={parameters.font}
                    position={[length / 2 - 4, -platformHeight + textSize / 2, (width / 2) + parameters.padding]}
                    letterSpacing={-0.1}
                    height={parameters.textDepth}
                    size={textSize}
                >
                    {parameters.year}
                    <meshStandardMaterial color={parameters.color} />
                </Text3D>
            </Center>
        </group>
    )
} 