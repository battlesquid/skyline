import { Text3D } from "@react-three/drei";
import { ContributionTower } from "./contribution_tower";
import { ContributionQuery } from "../../api/query";
import { ResultOf } from "gql.tada";
import { useThree } from "@react-three/fiber";
import { STLExporter } from "three/examples/jsm/Addons.js";
import { useSceneStore } from "../../scene";
import { useEffect } from "react";

interface SkylineModelProps {
    user: string;
    year: string;
    weeks: NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
}

export function SkylineModel(props: SkylineModelProps) {
    const { user, weeks, year } = props;
    const length = weeks.length / 2;
    const width = 7 / 2;
    const padding = 0.5;
    const platform_height = 2;
    const text_depth = 0.25;
    const scene = useThree((state) => state.scene);
    const sceneStore = useSceneStore();


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
        <>
            {weeks.map((week, i) =>
                week.contributionDays.map((day, j) => (
                    <ContributionTower key={day.date.toString()} day={day} x={i / 2} y={j / 2} height={day.contributionCount * 0.1 + 0.1} />
                )),
            )}
            <mesh position={[13, 0 - platform_height / 2, 1.5]}>
                <boxGeometry args={[length + padding * 2, platform_height, width + padding * 2]} />
                <meshStandardMaterial color={"#575757"} />
            </mesh>
            <Text3D
                font={"/Inter_Bold.json"}
                position={[0, 0 - platform_height / 2 - 0.5, 3.25 + padding]}
                letterSpacing={-0.1}
                height={text_depth}
            >
                {user}
                <meshStandardMaterial color={"#575757"} />
            </Text3D>
            <Text3D
                font={"/Inter_Bold.json"}
                position={[22, 0 - platform_height / 2 - 0.55, 3.25 + padding]}
                letterSpacing={-0.1}
                height={text_depth}
            >
                {year}
                <meshStandardMaterial color={"#575757"} />
            </Text3D>
        </>
    )
} 