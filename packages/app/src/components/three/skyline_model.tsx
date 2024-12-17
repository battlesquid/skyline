import { Center, Stars, Text3D } from "@react-three/drei";
import { ContributionTower } from "./contribution_tower";
import { ContributionQuery } from "../../api/query";
import { ResultOf } from "gql.tada";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { STLExporter } from "three/examples/jsm/Addons.js";
import { useSceneStore } from "../../scene";
import { useEffect, useRef, useState } from "react";
import { Group, Mesh } from "three";

interface SkylineModelProps {
    user: string;
    year: string;
    weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
}

export function SkylineModel(props: SkylineModelProps) {
    const { user, weeks, year } = props;
    const size = 0.5;
    const length = weeks.length * size;
    const width = 7 * size;
    const padding = 0.5;
    const font = "/Inter_Bold.json";
    const platform_height = size * 3;
    const text_size = platform_height / 2;
    const text_depth = 0.35;
    const tower_height = (count: number) => count * size / 10 + size / 10;
    const color = "#575757";
    const scene = useThree((state) => state.scene);
    const sceneStore = useSceneStore();

    console.log(length, width)

    const [usingControls, setUsingControls] = useState(false);
    const group = useRef<Group>(null!);
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
                        size={size}
                        day={day}
                        x={i * size - length / 2 + size / 2}
                        y={j * size - width / 2 + size / 2}
                        height={day.contributionCount * size / 10 + size / 10}
                    />
                ))
            )}
            <mesh position={[0, 0 - platform_height / 2, 0]}>
                <boxGeometry args={[length + padding * 2, platform_height, width + padding * 2]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <Text3D
                font={font}
                position={[0 - length / 2 + 1, -platform_height + text_size / 2, (width / 2) + padding]}
                letterSpacing={-0.1}
                height={text_depth}
                size={text_size}
            >
                {user}
                <meshStandardMaterial color={color} />
            </Text3D>
            <Center disableZ disableY>
                <Text3D
                    font={font}
                    position={[length / 2 - 4, -platform_height + text_size / 2, (width / 2) + padding]}
                    letterSpacing={-0.1}
                    height={text_depth}
                    size={text_size}
                >
                    {year}
                    <meshStandardMaterial color={color} />
                </Text3D>
            </Center>
        </group>
    )
} 