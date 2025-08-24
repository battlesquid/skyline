import { Instances, useBounds } from "@react-three/drei";
import {
    type MutableRefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Color, type Group as ThreeGroup } from "three";
import type {
    ContributionDay,
    ContributionWeek,
    ContributionWeeks,
} from "../api/types";
import { calculateFirstDayOffset } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useControlsStore } from "../stores/controls";
import { useModelStore } from "../stores/model";
import { useParametersContext } from "../stores/parameters";
import { ContributionTower } from "./contribution_tower";
import type { SkylineProps } from "./skyline";
import { SkylineBase } from "./skyline_base";
import { SkylineObjectNames } from "./utils";

export interface SkylineModelProps extends SkylineProps {
	group: MutableRefObject<ThreeGroup | null>;
}

export function SkylineModel(props: SkylineModelProps) {
	const { group, years } = props;
	const [initialized, setInitialized] = useState(false);
	const computed = useParametersContext((state) => state.computed);
	const inputs = useParametersContext((state) => state.inputs);

	const setDirty = useModelStore((state) => state.setDirty);
	const setSize = useModelStore((state) => state.setSize);
	const setModel = useModelStore((state) => state.setModel);

	const reset = useControlsStore((state) => state.reset);
	const clearReset = useControlsStore((state) => state.clearReset);

	const bounds = useBounds();
	let boundsTimeout: number | undefined;
	const clearBoundsTimeout = () => {
		if (boundsTimeout !== undefined) {
			clearTimeout(boundsTimeout);
		}
	};

	useEffect(() => {
		clearTimeout(boundsTimeout);
		setDirty(true);
		boundsTimeout = setTimeout(() => {
			if (group.current === null) {
				return;
			}
			setDirty(false);
			if (initialized) {
				bounds.refresh().clip().fit();
			} else {
				setInitialized(true);
			}
			setModel(group.current.clone());
		}, 1500);

		return clearBoundsTimeout;
	}, [
		inputs.dampening,
		inputs.name,
		inputs.nameOverride,
		inputs.startYear,
		inputs.endYear,
		inputs.padding,
		inputs.font,
		inputs.shape,
		inputs.insetText,
	]);

	useEffect(() => {
		if (reset === null) {
			return;
		}
		bounds.refresh().clip().fit().reset();
		clearReset();
	}, [reset]);

	useBoundingBox(
		{
			obj: group,
			setter: setSize,
		},
		[inputs, years],
	);

	const id = useRef<number>(0);
	const tempColor = new Color();
	const multColor = new Color();

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
			.flatMap((_) => tempColor.set(inputs.color));
		const instanced = Float32Array.from(
			raw.flatMap((_) => tempColor.set(inputs.color).toArray()),
		);
		return { raw, instanced };
	}, [contributionColors.raw.length, inputs.color]);

	const renderDay = (
		day: ContributionDay,
		yearIdx: number,
		weekIdx: number,
		weekOffset: number,
		dayIdx: number,
		id: MutableRefObject<number>,
	) => {
		if (day.contributionCount === 0) {
			return null;
		}
		const idx = id.current;
		id.current++;
		const YEAR_OFFSET = computed.modelWidth * yearIdx;
		const centerOffset =
			years.length === 1 ? 0 : -(computed.modelWidth * (years.length - 1)) / 2;
		const towerColors = inputs.showContributionColor
			? contributionColors.instanced
			: defaultColors.instanced;
		const highlightBase = inputs.showContributionColor
			? contributionColors.raw[idx]
			: defaultColors.raw[idx].getHex();
		const highlight = multColor.set(highlightBase).multiplyScalar(1.6).getHex();
		return (
			<ContributionTower
				key={day.date.toString()}
				day={day}
				x={
					weekIdx * inputs.towerSize -
					computed.halfModelLength +
					computed.towerSizeOffset
				}
				y={
					centerOffset +
					YEAR_OFFSET +
					((dayIdx + weekOffset) * inputs.towerSize -
						computed.halfModelWidth +
						computed.towerSizeOffset)
				}
				size={getDefaultParameters().inputs.towerSize}
				dampening={inputs.dampening}
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
		id.current = 0;
		return years.map((weeks, yearIdx) => renderYear(weeks, yearIdx, id));
	};

	return (
		<group ref={group}>
			<group name={SkylineObjectNames.TowersExportGroup} />
			{years.length > 0 && years[0].length > 0 && (
				<group name={SkylineObjectNames.TowersParent}>
					<Instances
						castShadow
						receiveShadow
						name={SkylineObjectNames.Towers}
						key={`${inputs.name}-${computed.formattedYear}-${inputs.showContributionColor}`}
						limit={contributionColors.instanced.length}
					>
						<boxGeometry>
							<instancedBufferAttribute
								attach="attributes-color"
								args={[
									inputs.showContributionColor
										? contributionColors.instanced
										: defaultColors.instanced,
									3,
								]}
							/>
						</boxGeometry>
						<meshStandardMaterial vertexColors={true} />
						{render()}
					</Instances>
				</group>
			)}
			<SkylineBase years={years} />
		</group>
	);
}
