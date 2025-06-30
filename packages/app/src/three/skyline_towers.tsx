import { useFrame } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import { ContributionDay, ContributionWeek, ContributionWeeks } from "../api/types";
import { calculateFirstDayOffset } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import { useParametersStore } from "../stores/parameters";

export interface SkylineTowersProps {
    years: ContributionWeeks[];
}

const tmp = new Object3D();

export function SkylineTowers(props: SkylineTowersProps) {
    const { years } = props;
    const parameters = useParametersStore(state => state.parameters);

    const [hoveredId, setHoveredId] = useState<number | undefined>(0);

    const id = useRef<number>(0);
    const tempColor = new Color();
    const multColor = new Color();

    const prevHovered = useRef<number | undefined>(0)
    const instancedMesh = useRef<InstancedMesh | null>(null);
    useEffect(() => {
        prevHovered.current = hoveredId;
        console.log("Prev Hovered: ", prevHovered.current)
    }, [hoveredId]);

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
            .flatMap((_) => tempColor.set(parameters.inputs.color));
        const instanced = Float32Array.from(
            raw.flatMap((_) => tempColor.set(parameters.inputs.color).toArray()),
        );
        return { raw, instanced };
    }, [contributionColors.raw.length, parameters.inputs.color]);

    const renderDay = (
        day: ContributionDay,
        yearIdx: number,
        weekIdx: number,
        weekOffset: number,
        dayIdx: number,
        id: MutableRefObject<number>,
    ) => {
        if (day.contributionCount === 0 || instancedMesh.current === null) {
            return null;
        }
        const idx = id.current;
        id.current++;
        const YEAR_OFFSET = parameters.computed.modelWidth * yearIdx;
        const centerOffset =
            years.length === 1
                ? 0
                : -(parameters.computed.modelWidth * (years.length - 1)) / 2;
        const towerColors = parameters.inputs.showContributionColor
            ? contributionColors.instanced
            : defaultColors.instanced;
        const highlightBase = parameters.inputs.showContributionColor
            ? contributionColors.raw[idx]
            : defaultColors.raw[idx];
        const highlight = multColor.set(highlightBase).multiplyScalar(1.6).getHex();

        const x = weekIdx * parameters.inputs.towerSize -
            parameters.computed.xMidpointOffset +
            parameters.computed.towerSizeOffset;

        const z = centerOffset + YEAR_OFFSET +
            ((dayIdx + weekOffset) * parameters.inputs.towerSize -
                parameters.computed.yMidpointOffset +
                parameters.computed.towerSizeOffset);

        const size = getDefaultParameters().inputs.towerSize;

        const height = (day.contributionCount * size) / parameters.inputs.dampening;

        tmp.position.set(x, height / 2, z);
        tmp.scale.set(size, height, size);

        if (hoveredId !== prevHovered.current) {
            if (idx === hoveredId) {
                console.log(`hovered on ${idx}`)
                tempColor.set(highlight).toArray(towerColors, idx * 3)
            } else {
                console.log("not hovered")
                tempColor.set(highlightBase).toArray(towerColors, idx * 3)
            }
            instancedMesh.current.geometry.attributes.color.needsUpdate = true;
        }
        tmp.updateMatrix();
        instancedMesh.current.setMatrixAt(idx, tmp.matrix);
    };

    const renderWeek = (
        week: ContributionWeek,
        yearIdx: number,
        weekIdx: number,
        weekOffset: number,
        id: MutableRefObject<number>,
    ) => {
        return week.contributionDays.map((day, dayIdx) =>
            renderDay(day, yearIdx, weekIdx, weekOffset, dayIdx, id),
        );
    };

    const renderYear = (
        weeks: ContributionWeeks,
        yearIdx: number,
        id: MutableRefObject<number>,
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
        if (instancedMesh.current === null) {
            return;
        }
        id.current = 0;
        years.map((weeks, yearIdx) => renderYear(weeks, yearIdx, id));
        instancedMesh.current.instanceMatrix.needsUpdate = true;
    };

    useFrame(state => {
        if (instancedMesh.current === null) {
            return;
        }
        let id = 0;
        years.map((weeks, yearIdx) => {
            return weeks.map((week, weekIdx) => {
                let weekOffset = 0;
                if (weekIdx === 0) {
                    weekOffset = calculateFirstDayOffset(week, weekIdx);
                }
                return week.contributionDays.map((day, dayIdx) => {
                    if (day.contributionCount === 0 || instancedMesh.current === null) {
                        return null;
                    }
                    const idx = id++;
                    const YEAR_OFFSET = parameters.computed.modelWidth * yearIdx;
                    const centerOffset =
                        years.length === 1
                            ? 0
                            : -(parameters.computed.modelWidth * (years.length - 1)) / 2;
                    const towerColors = parameters.inputs.showContributionColor
                        ? contributionColors.instanced
                        : defaultColors.instanced;
                    const highlightBase = parameters.inputs.showContributionColor
                        ? contributionColors.raw[idx]
                        : defaultColors.raw[idx];
                    const highlight = multColor.set(highlightBase).multiplyScalar(1.6).getHex();

                    const x = weekIdx * parameters.inputs.towerSize -
                        parameters.computed.xMidpointOffset +
                        parameters.computed.towerSizeOffset;

                    const z = centerOffset + YEAR_OFFSET +
                        ((dayIdx + weekOffset) * parameters.inputs.towerSize -
                            parameters.computed.yMidpointOffset +
                            parameters.computed.towerSizeOffset);

                    const size = getDefaultParameters().inputs.towerSize;

                    const height = (day.contributionCount * size) / parameters.inputs.dampening;

                    tmp.position.set(x, height / 2, z);
                    tmp.scale.set(size, height, size);

                    tmp.updateMatrix();
                    instancedMesh.current.setMatrixAt(idx, tmp.matrix);
                });
            })
        });
        instancedMesh.current.instanceMatrix.needsUpdate = true;
    })

    return (
        <group name="instances_group">
            <instancedMesh
                ref={instancedMesh}
                castShadow
                receiveShadow
                name="instances"
                args={[undefined, undefined, contributionColors.instanced.length]}
                onPointerMove={(e) => (e.stopPropagation(), setHoveredId(e.instanceId), console.log(e.instanceId))}
                onPointerOut={(e) => setHoveredId(undefined)}
            >
                <boxGeometry>
                    <instancedBufferAttribute
                        attach="attributes-color"
                        args={[
                            parameters.inputs.showContributionColor
                                ? contributionColors.instanced
                                : defaultColors.instanced,
                            3,
                        ]}
                    />
                </boxGeometry>
                <meshStandardMaterial toneMapped={false} vertexColors={true} />
            </instancedMesh>
        </group>
    )
}