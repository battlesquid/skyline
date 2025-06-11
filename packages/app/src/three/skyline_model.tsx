import { Instances, Text3D, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Color, type Group, type Mesh, MeshStandardMaterial } from "three";
import type {
    ContributionDay,
    ContributionWeek,
    ContributionWeeks,
} from "../api/types";
import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "../api/constants";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useSvgMesh } from "../hooks/useSvgMesh";
import { LOGOS } from "../logos";
import { useParametersStore, useSceneStore } from "../stores";
import { ContributionTower } from "./contribution_tower";
import { calculateFirstDayOffset, formatYearText } from "../api/utils";
import { type Dimensions, getDimensions } from "./utils";
import { RectangularFrustum } from "./rectangular_frustum_base";
import { useModelVariablesStore } from "../stores/model_variables";

export interface SkylineModelProps {
    group: RefObject<Group | null>;
    years: ContributionWeeks[];
}

export function SkylineModel(props: SkylineModelProps) {
    const { group, years } = props;
    const { parameters } = useParametersStore();
    const { variables, setModelVariables } = useModelVariablesStore();

    useEffect(() => {
        const modelLength = WEEKS_IN_YEAR * parameters.towerSize;
        const modelWidth = DAYS_IN_WEEK * parameters.towerSize;
        const platformHeight = parameters.towerSize * 3;
        const platformMidpoint = platformHeight / 2;
        const textSize = platformHeight / 2.2;
        const towerSizeOffset = parameters.towerSize / 2;
        const xMidpointOffset = modelLength / 2;
        const yMidpointOffset = modelWidth / 2;
        const paddingWidth = parameters.padding * 2;
        setModelVariables({
            modelLength,
            modelWidth,
            platformMidpoint,
            platformHeight,
            textSize,
            towerSizeOffset,
            xMidpointOffset,
            yMidpointOffset,
            paddingWidth
        })
    }, [
        parameters.towerSize,
        parameters.padding
    ])

    const scene = useThree((state) => state.scene);
    const sceneStore = useSceneStore();

    const bounds = useBounds();
    let boundsTimeout: number | undefined = undefined;
    useEffect(() => {
        if (boundsTimeout !== undefined) {
            clearTimeout(boundsTimeout);
        }
        sceneStore.setDirty(true);
        boundsTimeout = setTimeout(() => {
            if (group.current === null) {
                return;
            }
            sceneStore.setScene(scene.clone());
            bounds.refresh(group.current).clip().fit().reset();
            sceneStore.setDirty(false);
        }, 1500);

        return () => {
            if (boundsTimeout !== undefined) {
                clearTimeout(boundsTimeout);
            }
        };
    }, [
        parameters.dampening,
        parameters.name,
        parameters.startYear,
        parameters.endYear,
        parameters.padding,
        parameters.font,
    ]);

    const yearRef = useRef<Mesh | null>(null);
    const nameRef = useRef<Mesh | null>(null);

    const [yearDimensions, setYearDimensions] = useState<Dimensions>({
        width: 0,
        height: 0,
    });
    const [nameDimensions, setNameDimensions] = useState<Dimensions>({
        width: 0,
        height: 0,
    });
    useEffect(() => {
        if (nameRef.current === null || yearRef.current === null) {
            return;
        }
        setNameDimensions(getDimensions(nameRef.current));
        setYearDimensions(getDimensions(yearRef.current));
    }, [
        parameters.name,
        parameters.startYear,
        parameters.endYear,
        parameters.font,
        years,
    ]);

    useBoundingBox(
        {
            obj: group,
            setter: (bb) => sceneStore.setSize(bb),
        },
        [parameters, yearDimensions, nameDimensions, years],
    );

    const id = useRef<number>(0);
    const tempColor = new Color();
    const multColor = new Color();

    const modelColor = parameters.showContributionColor
        ? getDefaultParameters().color
        : parameters.color;

    const contributionColors = useMemo(() => {
        if (years.length === 0) {
            return { raw: [], instanced: Float32Array.from([]) };
        }
        const raw = years.flatMap((weeks) => {
            return weeks.flatMap((week) => {
                return week.contributionDays
                    .filter((day) => day.contributionCount > 0)
                    .flatMap((day) => day.color);
            });
        });
        const instanced = Float32Array.from(
            raw.flatMap((c) => tempColor.set(c).toArray()),
        );
        return { raw, instanced };
    }, [years]);

    const defaultColors = useMemo(() => {
        if (contributionColors.raw.length === 0) {
            return { raw: [], instanced: Float32Array.from([]) };
        }
        const raw = Array(contributionColors.raw.length)
            .fill(0)
            .flatMap((_) => tempColor.set(parameters.color));
        const instanced = Float32Array.from(
            raw.flatMap((_) => tempColor.set(parameters.color).toArray()),
        );
        return { raw, instanced };
    }, [contributionColors.raw.length, parameters.color]);

    const renderDay = (
        day: ContributionDay,
        yearIdx: number,
        weekIdx: number,
        weekOffset: number,
        dayIdx: number,
        id: RefObject<number>,
    ) => {
        if (day.contributionCount === 0) {
            return null;
        }
        const idx = id.current;
        id.current++;
        const YEAR_OFFSET = variables.modelWidth * yearIdx;
        const centerOffset =
            years.length === 1 ? 0 : -(variables.modelWidth * (years.length - 1)) / 2;
        const towerColors = parameters.showContributionColor
            ? contributionColors.instanced
            : defaultColors.instanced;
        const highlightBase = parameters.showContributionColor
            ? contributionColors.raw[idx]
            : defaultColors.raw[idx];
        const highlight = multColor.set(highlightBase).multiplyScalar(1.6).getHex();
        return (
            <ContributionTower
                key={day.date.toString()}
                day={day}
                x={
                    weekIdx * parameters.towerSize - variables.xMidpointOffset + variables.towerSizeOffset
                }
                y={
                    centerOffset +
                    YEAR_OFFSET +
                    ((dayIdx + weekOffset) * parameters.towerSize -
                        variables.yMidpointOffset +
                        variables.towerSizeOffset)
                }
                size={getDefaultParameters().towerSize}
                dampening={parameters.dampening}
                onPointerEnter={() =>
                    tempColor.set(highlight).toArray(towerColors, idx * 3)
                }
                onPointerLeave={() =>
                    tempColor.set(highlightBase).toArray(towerColors, idx * 3)
                }
            />
        );
    };

    const renderWeek = (
        week: ContributionWeek,
        yearIdx: number,
        weekIdx: number,
        weekOffset: number,
        id: RefObject<number>,
    ) => {
        return week.contributionDays.map((day, dayIdx) =>
            renderDay(day, yearIdx, weekIdx, weekOffset, dayIdx, id),
        );
    };

    const renderYear = (
        weeks: ContributionWeeks,
        yearIdx: number,
        id: RefObject<number>,
    ) => {
        return weeks.map((week, weekIdx) => {
            let weekOffset = 0;
            if (weekIdx === 0) {
                weekOffset = calculateFirstDayOffset(week, weekIdx);
            }
            return renderWeek(week, yearIdx, weekIdx, weekOffset, id);
        });
    };

    const render = () => {
        id.current = 0;
        return years.map((weeks, yearIdx) => renderYear(weeks, yearIdx, id));
    };

    const logo = useRef<Group | null>(null);
    const material = useMemo(
        () =>
            new MeshStandardMaterial({
                color: parameters.showContributionColor
                    ? getDefaultParameters().color
                    : parameters.color,
            }),
        [parameters.color, parameters.showContributionColor],
    );
    const { meshes } = useSvgMesh(LOGOS.Circle, material);
    useEffect(() => {
        if (logo.current === null) {
            return;
        }
        logo.current.clear();
        for (const mesh of meshes) {
            logo.current?.add(mesh);
        }
        logo.current.scale.set(0.005, -0.005, 0.005);
    }, [logo.current, meshes]);

    return (
        <group ref={group}>
            <group name="export_group" />
            {years.length > 0 && years[0].length > 0 && (
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
                                    3,
                                ]}
                            />
                        </boxGeometry>
                        <meshStandardMaterial toneMapped={false} vertexColors={true} />
                        {render()}
                    </Instances>
                </group>
            )}
            <mesh castShadow receiveShadow position={[0, -variables.platformMidpoint, 0]}>
                {/* <boxGeometry
                    args={[
                        MODEL_LENGTH + PADDING_WIDTH,
                        PLATFORM_HEIGHT,
                        MODEL_WIDTH * years.length + PADDING_WIDTH,
                    ]}
                /> */}
                {/* <meshStandardMaterial color={modelColor} /> */}
            </mesh>
            <RectangularFrustum
                width={variables.modelLength + variables.paddingWidth}
                length={variables.modelWidth * years.length + variables.paddingWidth}
                height={variables.platformHeight}
                color={modelColor}
                years={years}
            />
            <group
                ref={logo}
                position={[
                    -variables.xMidpointOffset + 5,
                    -variables.platformMidpoint / 2 + 0.5,
                    (variables.modelWidth * years.length) / 2 + parameters.padding - 0.1,
                ]}
            />
            {/* <Text3D
                ref={nameRef}
                font={parameters.font}
                receiveShadow
                castShadow
                position={[
                    -X_MIDPOINT_OFFSET + nameDimensions.width / 2 + 12,
                    -PLATFORM_MIDPOINT - 0.5,
                    (MODEL_WIDTH * years.length) / 2 + parameters.padding - 0.1,
                ]}
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
                position={[
                    X_MIDPOINT_OFFSET - yearDimensions.width / 2 - 5,
                    -PLATFORM_MIDPOINT - 0.5,
                    (MODEL_WIDTH * years.length) / 2 + parameters.padding - 0.1,
                ]}
                height={parameters.textDepth}
                size={TEXT_SIZE}
            >
                {formatYearText(parameters.startYear, parameters.endYear)}
                <meshStandardMaterial color={modelColor} />
            </Text3D> */}
        </group>
    );
}
