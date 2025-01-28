import { Instances, Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, Color, Group, Mesh, Vector3 } from "three";
import { ContributionDay, ContributionWeek, ContributionWeeks } from "../api/types";
import { defaults, SkylineModelParameters } from "../parameters";
import { useSceneStore } from "../stores";
import { ContributionTower } from "./contribution_tower";

export interface SkylineModelProps {
    parameters: SkylineModelParameters;
    years: ContributionWeeks[]
}

export interface ContributionInstanceDay extends ContributionDay {
    yearIdx: number;
    weekIdx: number;
    dayIdx: number;
    weekOffset: number;
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

const formatYearText = (start: number, end: number) => {
    if (start === end) {
        return `${start}`
    }
    return `${start}-${end}`
}

export function SkylineModel(props: SkylineModelProps) {
    const { parameters, years } = props;

    const MODEL_LENGTH = years[0].length * parameters.towerSize;
    const MODEL_WIDTH = 7 * parameters.towerSize;
    const PLATFORM_HEIGHT = parameters.towerSize * 3;
    const PLATFORM_MIDPOINT = PLATFORM_HEIGHT / 2;
    const TEXT_SIZE = PLATFORM_HEIGHT / 2;
    const TOWER_SIZE_OFFSET = parameters.towerSize / 2;
    const X_MIDPOINT_OFFSET = MODEL_LENGTH / 2;
    const Y_MIDPOINT_OFFSET = MODEL_WIDTH / 2;
    const PADDING_WIDTH = parameters.padding * 2;

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
    }, [parameters.towerDampening, parameters.name, parameters.startYear, parameters.endYear, parameters.padding, parameters.font]);

    const yearRef = useRef<Mesh>(null!);
    const nameRef = useRef<Mesh>(null!);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [parameters.name, parameters.startYear, parameters.endYear, parameters.font])

    const group = useRef<Group>(null!);
    useEffect(() => {
        const bb = new Box3().setFromObject(group.current, true);
        sceneStore.setSize(bb.getSize(new Vector3()));
    }, [parameters, yearDimensions, nameDimensions, years]);
    
    const tempColor = new Color();
    
    const renderContributionDay = (day: ContributionDay, yearIdx: number, weekIdx: number, weekOffset: number, dayIdx: number) => {
        const YEAR_OFFSET = MODEL_WIDTH * yearIdx;
        const centerOffset = years.length === 1
            ? 0
            : -(MODEL_WIDTH * (years.length - 1)) / 2;
        return (
            <ContributionTower
                key={day.date.toString()}
                day={day}
                x={weekIdx * parameters.towerSize - X_MIDPOINT_OFFSET + TOWER_SIZE_OFFSET}
                y={centerOffset + YEAR_OFFSET + ((dayIdx + weekOffset) * parameters.towerSize - Y_MIDPOINT_OFFSET + TOWER_SIZE_OFFSET)}
                size={parameters.towerSize}
                dampening={parameters.towerDampening}
            />
        )
    }

    const renderContributionWeek = (week: ContributionWeek, yearIdx: number, weekIdx: number) => {
        return week.contributionDays.map((day, dayIdx) => renderContributionDay(day, yearIdx, weekIdx, calculateFirstDayOffset(week, weekIdx), dayIdx))
    }

    const renderContributionYear = (weeks: ContributionWeeks, yearIdx: number) => {
        return weeks.map((week, weeksIdx) => renderContributionWeek(week, yearIdx, weeksIdx))
    }

    const geometry = useMemo(() => {
        const colors = Float32Array.from(
            years.flatMap((weeks) => {
                return weeks.flatMap((week) => {
                    return week.contributionDays.flatMap((day) => tempColor.set(day.color).toArray())
                })
            })
        );
        if (parameters.showContributionColor) {
            return (
                <>
                    <meshStandardMaterial toneMapped={false} vertexColors />
                    <boxGeometry>
                        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
                    </boxGeometry>
                </>
            )
        }
        return (
            <>
                <meshStandardMaterial color={parameters.color} />
                <boxGeometry />
            </>
        )
    }, [years, parameters.showContributionColor, parameters.color])

    return (
        <group ref={group}>
            <group name="instances_container">
                <Instances
                    name={"instances"}
                    key={`${years.length}-${parameters.showContributionColor}`}
                    range={100000}
                    limit={365 * (years.length + 1)}
                >
                    {geometry}
                    {years.map((weeks, yearIdx) => renderContributionYear(weeks, yearIdx))}
                </Instances>
            </group>
            <mesh position={[0, -PLATFORM_MIDPOINT, 0]}>
                <boxGeometry args={[MODEL_LENGTH + PADDING_WIDTH, PLATFORM_HEIGHT, MODEL_WIDTH * years.length + PADDING_WIDTH]} />
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </mesh>
            <Text3D
                ref={nameRef}
                font={parameters.font}
                position={[-X_MIDPOINT_OFFSET + nameDimensions.width / 2 + 1, -PLATFORM_MIDPOINT, (MODEL_WIDTH * years.length / 2) + parameters.padding]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {parameters.name}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
            <Text3D
                ref={yearRef}
                font={parameters.font}
                position={[X_MIDPOINT_OFFSET - yearDimensions.width / 2 - 1, -PLATFORM_MIDPOINT, (MODEL_WIDTH * years.length / 2) + parameters.padding]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {formatYearText(parameters.startYear, parameters.endYear)}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
        </group>
    )
} 