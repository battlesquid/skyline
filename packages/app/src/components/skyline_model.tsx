import { InstancedAttribute, Instances, Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { Color, Group, Mesh, MeshStandardMaterial } from "three";
import { ContributionDay, ContributionWeek, ContributionWeeks } from "../api/types";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useSvgMesh } from "../hooks/useSvgMesh";
import { LOGOS } from "../logos";
import { useParametersStore, useSceneStore } from "../stores";
import { ContributionTower } from "./contribution_tower";
import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "../constants";

export interface SkylineModelProps {
    group: MutableRefObject<Group>;
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
    const { group, years } = props;
    const { parameters } = useParametersStore();
    const MODEL_LENGTH = WEEKS_IN_YEAR * parameters.towerSize;
    const MODEL_WIDTH = DAYS_IN_WEEK * parameters.towerSize;
    const PLATFORM_HEIGHT = parameters.towerSize * 3;
    const PLATFORM_MIDPOINT = PLATFORM_HEIGHT / 2;
    const TEXT_SIZE = PLATFORM_HEIGHT / 2.2;
    const TOWER_SIZE_OFFSET = parameters.towerSize / 2;
    const X_MIDPOINT_OFFSET = MODEL_LENGTH / 2;
    const Y_MIDPOINT_OFFSET = MODEL_WIDTH / 2;
    const PADDING_WIDTH = parameters.padding * 2;

    const scene = useThree((state) => state.scene);
    const sceneStore = useSceneStore();

    const bounds = useBounds();
    let boundsTimeout: number | undefined = undefined;
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
    }, [parameters.dampening, parameters.name, parameters.startYear, parameters.endYear, parameters.padding, parameters.font]);

    const yearRef = useRef<Mesh | null>(null);
    const nameRef = useRef<Mesh | null>(null);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    useEffect(() => {
        if (nameRef.current === null || yearRef.current === null) {
            return;
        }
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [parameters.name, parameters.startYear, parameters.endYear, parameters.font, years])

    useBoundingBox({
        obj: group,
        setter: (bb) => sceneStore.setSize(bb)
    }, [parameters, yearDimensions, nameDimensions, years]);


    const id = useRef<number>(0);
    const tempColor = new Color();
    const multColor = new Color();

    const modelColor = parameters.showContributionColor ? getDefaultParameters().color : parameters.color

    const contributionColors = useMemo(() => {
        const raw = years.flatMap((weeks) => {
            return weeks.flatMap((week) => {
                return week.contributionDays
                    .filter((day) => day.contributionCount > 0)
                    .flatMap((day) => day.color)
            });
        });
        const instanced = Float32Array.from(raw.flatMap(c => tempColor.set(c).toArray()));
        return { raw, instanced };
    }, [years]);

    const defaultColors = useMemo(() => {
        const raw = Array(contributionColors.raw.length).fill(0).flatMap(_ => tempColor.set(parameters.color))
        const instanced = Float32Array.from(raw.flatMap(_ => tempColor.set(parameters.color).toArray()));
        return { raw, instanced };
    }, [contributionColors.raw.length, parameters.color]);

    const renderDay = (day: ContributionDay, yearIdx: number, weekIdx: number, weekOffset: number, dayIdx: number, id: MutableRefObject<number>) => {
        if (day.contributionCount === 0) {
            return null;
        }
        const idx = id.current;
        id.current++;
        const YEAR_OFFSET = MODEL_WIDTH * yearIdx;
        const centerOffset = years.length === 1
            ? 0
            : -(MODEL_WIDTH * (years.length - 1)) / 2;
        const towerColors = parameters.showContributionColor ? contributionColors.instanced : defaultColors.instanced;
        const highlightBase = parameters.showContributionColor ? contributionColors.raw[idx] : defaultColors.raw[idx];
        const highlight = multColor.set(highlightBase).multiplyScalar(1.6).getHex();
        return (
            <ContributionTower
                key={day.date.toString()}
                day={day}
                x={weekIdx * parameters.towerSize - X_MIDPOINT_OFFSET + TOWER_SIZE_OFFSET}
                y={centerOffset + YEAR_OFFSET + ((dayIdx + weekOffset) * parameters.towerSize - Y_MIDPOINT_OFFSET + TOWER_SIZE_OFFSET)}
                size={getDefaultParameters().towerSize}
                dampening={parameters.dampening}
                onPointerEnter={() => tempColor.set(highlight).toArray(towerColors, idx * 3)}
                onPointerLeave={() => tempColor.set(highlightBase).toArray(towerColors, idx * 3)}
            />
        )
    }

    const renderWeek = (week: ContributionWeek, yearIdx: number, weekIdx: number, weekOffset: number, id: MutableRefObject<number>) => {
        return week.contributionDays.map((day, dayIdx) => renderDay(day, yearIdx, weekIdx, weekOffset, dayIdx, id));
    }

    const renderYear = (weeks: ContributionWeeks, yearIdx: number, id: MutableRefObject<number>) => {
        return weeks.map((week, weekIdx) => {
            let weekOffset = 0;
            if (weekIdx === 0) {
                weekOffset = calculateFirstDayOffset(week, weekIdx);
            }
            return renderWeek(week, yearIdx, weekIdx, weekOffset, id)
        });
    }

    const render = () => {
        id.current = 0;
        return years.map((weeks, yearIdx) => renderYear(weeks, yearIdx, id))
    }

    const logo = useRef<Group | null>(null);
    const material = useMemo(() =>
        new MeshStandardMaterial({
            color: parameters.showContributionColor
                ? getDefaultParameters().color
                : parameters.color
        }),
        [parameters.color, parameters.showContributionColor]
    );
    const { meshes } = useSvgMesh(LOGOS.Circle, material);
    useEffect(() => {
        if (logo.current === null) {
            return;
        }
        logo.current.clear();
        meshes.forEach((mesh) => logo.current?.add(mesh));
        logo.current.scale.set(0.005, -0.005, 0.005);
    }, [logo.current, meshes]);

    if (years[0].length === 0) {
        return null;
    }

    return (
        <group ref={group}>
            <group name="export_group"></group>
            <group name="instances_group">
                <Instances
                    castShadow
                    receiveShadow
                    name="instances"
                    key={`${years.length}-${parameters.showContributionColor}`}
                    limit={contributionColors.instanced.length}
                >
                    <boxGeometry>
                        <instancedBufferAttribute
                            attach="attributes-color"
                            args={[
                                parameters.showContributionColor
                                    ? contributionColors.instanced
                                    : defaultColors.instanced,
                                3
                            ]}
                        />
                    </boxGeometry>
                    <meshStandardMaterial toneMapped={false} vertexColors={true} />
                    {render()}
                </Instances>
            </group>
            <mesh castShadow receiveShadow position={[0, -PLATFORM_MIDPOINT, 0]}>
                <boxGeometry args={[MODEL_LENGTH + PADDING_WIDTH, PLATFORM_HEIGHT, MODEL_WIDTH * years.length + PADDING_WIDTH]} />
                <meshStandardMaterial color={modelColor} />
            </mesh>
            <group ref={logo} position={[-X_MIDPOINT_OFFSET + 5, -PLATFORM_MIDPOINT / 2 + 0.5, (MODEL_WIDTH * years.length / 2) + parameters.padding - 0.1]} />
            <Text3D
                ref={nameRef}
                font={parameters.font}
                receiveShadow
                castShadow
                position={[-X_MIDPOINT_OFFSET + nameDimensions.width / 2 + 12, -PLATFORM_MIDPOINT - 0.5, (MODEL_WIDTH * years.length / 2) + parameters.padding - 0.1]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {parameters.name}
                <meshStandardMaterial color={modelColor} />
            </Text3D>
            <Text3D
                ref={yearRef}
                font={parameters.font}
                receiveShadow
                castShadow
                position={[X_MIDPOINT_OFFSET - yearDimensions.width / 2 - 5, -PLATFORM_MIDPOINT - 0.5, (MODEL_WIDTH * years.length / 2) + parameters.padding - 0.1]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {formatYearText(parameters.startYear, parameters.endYear)}
                <meshStandardMaterial color={modelColor} />
            </Text3D>
        </group>
    )
} 