import { Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { defaults, SkylineModelParameters } from "../parameters";
import { useSceneStore } from "../stores";
import { ContributionTower } from "./contribution_tower";
import { ContributionWeek, ContributionWeeks } from "../api/types";
import { Box3, Group, Mesh, Vector3 } from "three";

export interface SkylineModelProps {
    parameters: SkylineModelParameters;
    weeks: ContributionWeeks;
}

type Dimensions = {
    width: number;
    height: number;
}

const getDimensions = (mesh: Mesh): Dimensions => {
    mesh.geometry.computeBoundingBox();
    mesh.geometry.center();
    return {
        width: mesh.geometry.boundingBox!.max.x - mesh.geometry.boundingBox!.min.x,
        height: mesh.geometry.boundingBox!.max.y - mesh.geometry.boundingBox!.min.y
    }
}

const calculateFirstDayOffset = (week: ContributionWeek, weekNo: number): number => {
    return weekNo === 0
        ? new Date(week.firstDay).getUTCDay()
        : 0;
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
    }, [parameters.towerSize, parameters.towerDampening, parameters.name, parameters.year, parameters.padding, parameters.font]);

    const yearRef = useRef<Mesh>(null!);
    const nameRef = useRef<Mesh>(null!);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [parameters.name, parameters.year, parameters.font, parameters.towerSize])

    const group = useRef<Group>(null!);
    useEffect(() => {
        const bb = new Box3().setFromObject(group.current, true);
        sceneStore.setSize(bb.getSize(new Vector3()));
    }, [parameters, yearDimensions, nameDimensions, weeks]);

    return (
        <group ref={group}>
            {weeks.map((week, i) =>
                week.contributionDays.map((day, j) => (
                    <ContributionTower
                        key={day.date.toString()}
                        day={day}
                        x={i * parameters.towerSize - length / 2 + parameters.towerSize / 2}
                        y={(j + calculateFirstDayOffset(week, i)) * parameters.towerSize - width / 2 + parameters.towerSize / 2}
                        height={day.contributionCount * parameters.towerSize / parameters.towerDampening + parameters.towerSize / parameters.towerDampening}
                        size={parameters.towerSize}
                        defaultColor={parameters.color}
                        showContributionColor={parameters.showContributionColor}
                    />
                ))
            )}
            <mesh position={[0, -platformHeight / 2, 0]}>
                <boxGeometry args={[length + parameters.padding * 2, platformHeight, width + parameters.padding * 2]} />
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </mesh>
            <Text3D
                ref={nameRef}
                font={parameters.font}
                position={[-length / 2 + nameDimensions.width / 2 + 1, -platformHeight / 2, (width / 2) + parameters.padding]}
                height={parameters.textDepth}
                size={textSize}
            >
                {parameters.name}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
            <Text3D
                ref={yearRef}
                font={parameters.font}
                position={[length / 2 - yearDimensions.width / 2 - 1, -platformHeight / 2, (width / 2) + parameters.padding]}
                height={parameters.textDepth}
                size={textSize}
            >
                {parameters.year}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
        </group>
    )
} 