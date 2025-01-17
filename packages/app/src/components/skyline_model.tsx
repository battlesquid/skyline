import { Center, Instances, Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Box3, Group, Mesh, Vector3 } from "three";
import { ContributionDay, ContributionWeek, ContributionWeeks } from "../api/types";
import { defaults, SkylineModelParameters } from "../parameters";
import { useSceneStore } from "../stores";
import { ContributionTower } from "./contribution_tower";
import { groupby } from "../utils";

export interface SkylineModelProps {
    parameters: SkylineModelParameters;
    years: ContributionWeeks[]
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
    const TEXT_SIZE = PLATFORM_HEIGHT / 2;
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
    }, [parameters.towerSize, parameters.towerDampening, parameters.name, parameters.startYear, parameters.endYear, parameters.padding, parameters.font]);

    const yearRef = useRef<Mesh>(null!);
    const nameRef = useRef<Mesh>(null!);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [parameters.name, parameters.startYear, parameters.endYear, parameters.font, parameters.towerSize])

    const group = useRef<Group>(null!);
    useEffect(() => {
        const bb = new Box3().setFromObject(group.current, true);
        sceneStore.setSize(bb.getSize(new Vector3()));
    }, [parameters, yearDimensions, nameDimensions, years]);

    useEffect(() => {
        const days: ContributionDay[] = [];
        years.forEach(weeks => {
            weeks.forEach(week => {
                week.contributionDays.forEach(day => days.push(day))
            })
        });
        const grouped = groupby(days, d => d.color)
        console.log(grouped)
    }, [years])

    const renderContributionDay = (day: ContributionDay, yearIdx: number, weekIdx: number, weekOffset: number, dayIdx: number) => {
        const TOWER_OFFSET = parameters.towerSize / 2;
        const YEAR_OFFSET = MODEL_WIDTH * yearIdx;
        const X_OFFSET = MODEL_LENGTH / 2;
        const Y_OFFSET = MODEL_WIDTH / 2;
        return (
            <ContributionTower
                key={day.date.toString()}
                day={day}
                x={weekIdx * parameters.towerSize - X_OFFSET + TOWER_OFFSET}
                y={YEAR_OFFSET + ((dayIdx + weekOffset) * parameters.towerSize - Y_OFFSET + TOWER_OFFSET)}
                height={day.contributionCount * parameters.towerSize / parameters.towerDampening + parameters.towerSize / parameters.towerDampening}
                size={parameters.towerSize}
                defaultColor={parameters.color}
                showContributionColor={parameters.showContributionColor}
            />
        )
    }

    const renderContributionWeek = (week: ContributionWeek, yearIdx: number, weekIdx: number) => {
        return week.contributionDays.map((day, dayIdx) => renderContributionDay(day, yearIdx, weekIdx, calculateFirstDayOffset(week, weekIdx), dayIdx))
    }

    const renderContributionYear = (weeks: ContributionWeeks, yearIdx: number) => {
        return weeks.map((week, weeksIdx) => renderContributionWeek(week, yearIdx, weeksIdx))
    }

    return (
        <group ref={group}>
            <Center cacheKey={years.length} disableX disableY>
                <Instances key={years.length} range={100000} limit={365 * (years.length + 1)}>
                    <boxGeometry />
                    <meshStandardMaterial color={parameters.color} />
                    {years.map((weeks, yearIdx) => renderContributionYear(weeks, yearIdx))}
                </Instances>
            </Center>
            <mesh position={[0, -PLATFORM_HEIGHT / 2, 0]}>
                <boxGeometry args={[MODEL_LENGTH + parameters.padding * 2, PLATFORM_HEIGHT, MODEL_WIDTH * years.length + parameters.padding * 2]} />
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </mesh>
            <Text3D
                ref={nameRef}
                font={parameters.font}
                position={[-MODEL_LENGTH / 2 + nameDimensions.width / 2 + 1, -PLATFORM_HEIGHT / 2, (MODEL_WIDTH * years.length / 2) + parameters.padding]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {parameters.name}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
            <Text3D
                ref={yearRef}
                font={parameters.font}
                position={[MODEL_LENGTH / 2 - yearDimensions.width / 2 - 1, -PLATFORM_HEIGHT / 2, (MODEL_WIDTH * years.length / 2) + parameters.padding]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {formatYearText(parameters.startYear, parameters.endYear)}
                <meshStandardMaterial color={parameters.showContributionColor ? defaults.color : parameters.color} />
            </Text3D>
        </group>
    )
} 