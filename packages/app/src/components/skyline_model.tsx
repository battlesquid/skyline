import { AccumulativeShadows, Environment, Grid, MeshReflectorMaterial, RandomizedLight, Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { memo, useEffect, useRef, useState } from "react";
import { defaults, SkylineModelParameters } from "../parameters";
import { useModelStore } from "../stores";
import { ContributionTower } from "./contribution_tower";
import { ContributionWeek, ContributionWeeks } from "../api/types";
import { Group, Mesh } from "three";
import { useMantineTheme } from "@mantine/core";

export interface SkylineModelProps {
    parameters: SkylineModelParameters;
    weeks: ContributionWeeks;
}

type Dimensions = {
    width: number;
    height: number;
}

export function SkylineModel(props: SkylineModelProps) {
    const { parameters, weeks } = props;
    const length = weeks.length * parameters.towerSize;
    const width = 7 * parameters.towerSize;
    const platformHeight = parameters.towerSize * 3;
    const textSize = platformHeight / 2;
    const model = useRef<Group>(null!);
    const modelStore = useModelStore();

    const theme = useMantineTheme();

    const bounds = useBounds();
    let boundsTimeout: NodeJS.Timeout | undefined = undefined;
    useEffect(() => {
        if (boundsTimeout !== undefined) {
            clearTimeout(boundsTimeout)
        }
        modelStore.setDirty(true);
        boundsTimeout = setTimeout(() => {
            modelStore.setModel(model.current);
            bounds.refresh(model.current).clip().fit();
            modelStore.setDirty(false);
        }, 1500);

        return () => {
            if (boundsTimeout !== undefined) {
                clearTimeout(boundsTimeout)
            }
        }
    }, [props.parameters.towerSize, props.parameters.towerDampening, props.parameters.name, props.parameters.year, props.parameters.padding, props.parameters.font]);

    const getDimensions = (mesh: Mesh): Dimensions => {
        mesh.geometry.computeBoundingBox();
        mesh.geometry.center();
        return {
            width: mesh.geometry.boundingBox!.max.x - mesh.geometry.boundingBox!.min.x,
            height: mesh.geometry.boundingBox!.max.y - mesh.geometry.boundingBox!.min.y
        }
    }

    const yearRef = useRef<Mesh>(null!);
    const nameRef = useRef<Mesh>(null!);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [parameters.name, parameters.year, parameters.font, parameters.towerSize])

    const calculateFirstDayOffset = (week: ContributionWeek, weekNo: number): number => {
        return weekNo === 0
            ? new Date(week.firstDay).getUTCDay()
            : 0;
    }

    return (
        <>
            <mesh
                position={[0, -platformHeight - 0.1, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                castShadow
            >
                <planeGeometry args={[10000, 10000]} />
                <MeshReflectorMaterial
                    mirror={0.4}
                    color={theme.colors.dark[8]}
                    blur={[400, 400]}
                    resolution={1024}
                    mixBlur={0.2}
                    mixStrength={3}
                    depthScale={1}
                    minDepthThreshold={0.85}
                    metalness={0}
                    roughness={1}
                />
            </mesh>
            {/* <Grid
                args={[10.5, 10.5]}
                cellSize={10.5}
                position={[0, -platformHeight, 0]}
                infiniteGrid={true}
                fadeDistance={20}
                cellColor={"#AAAAAA"}
                fadeFrom={0}
            /> */}
            <group ref={model}>
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
                <mesh castShadow receiveShadow position={[0, -platformHeight / 2, 0]}>
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
        </>

    )
} 