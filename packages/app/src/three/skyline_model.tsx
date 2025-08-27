import { Instances, useBounds } from "@react-three/drei";
import {
	type MutableRefObject,
	useEffect,
	useRef,
	useState
} from "react";
import { Color, type InstancedMesh, type Group as ThreeGroup } from "three";
import type {
	ContributionDay,
	ContributionWeek,
	ContributionWeeks,
} from "../api/types";
import { calculateFirstDayOffset } from "../api/utils";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useControlsStore } from "../stores/controls";
import { useModelStore } from "../stores/model";
import { DEFAULT_INPUT_PARAMETERS, useParametersContext } from "../stores/parameters";
import { isNullish } from "../utils";
import { ContributionTower } from "./contribution_tower";
import type { SkylineProps } from "./skyline";
import { SkylineBase } from "./skyline_base";
import { SkylineObjectNames } from "./utils";

export interface SkylineModelProps extends SkylineProps {
	group: MutableRefObject<ThreeGroup | null>;
}

const tempColor = new Color();

export function SkylineModel({
	group,
	years
}: SkylineModelProps) {
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
		inputs.showContributionColor,
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

	const instancesRef = useRef<InstancedMesh | null>(null)

	const bufferlen = years.flatMap((weeks) => {
		return weeks.flatMap((week) => {
			return week.contributionDays.filter((day) => day.contributionCount > 0);
		});
	}).length;

	const renderDay = (
		day: ContributionDay,
		yearIdx: number,
		weekIdx: number,
		weekOffset: number,
		dayIdx: number,
	) => {
		if (day.contributionCount === 0) {
			return null;
		}
		const YEAR_OFFSET = computed.modelWidth * yearIdx;
		const centerOffset =
			years.length === 1 ? 0 : -(computed.modelWidth * (years.length - 1)) / 2;
		const color = tempColor.set(inputs.showContributionColor ? day.color : inputs.color).clone()
		return (
			<ContributionTower
				key={day.date.toString()}
				day={day}
				color={color}
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
				size={DEFAULT_INPUT_PARAMETERS.towerSize}
				dampening={inputs.dampening}
				onPointerEnter={() => {
					if (isNullish(instancesRef.current)) {
						return;
					}
				}}
				onPointerLeave={() => {
					if (isNullish(instancesRef.current)) {
						return;
					}
				}}
			/>
		);
	};

	const renderWeek = (
		week: ContributionWeek,
		yearIdx: number,
		weekIdx: number,
		weekOffset: number,
	) => {
		return week.contributionDays.map((day, dayIdx) =>
			renderDay(day, yearIdx, weekIdx, weekOffset, dayIdx),
		);
	};

	const renderYear = (
		weeks: ContributionWeeks,
		yearIdx: number,
	) => {
		return weeks.map((week, weekIdx) => {
			const weekOffset = weekIdx === 0
				? calculateFirstDayOffset(week, weekIdx)
				: 0;
			return renderWeek(week, yearIdx, weekIdx, weekOffset);
		});
	};

	const render = () => {
		return years.map((weeks, yearIdx) => renderYear(weeks, yearIdx));
	};

	return (
		<group ref={group}>
			<group name={SkylineObjectNames.TowersExportGroup} />
			{years.length > 0 && years[0].length > 0 && (
				<group name={SkylineObjectNames.TowersParent}>
					<Instances
						ref={instancesRef}
						name={SkylineObjectNames.Towers}
						key={`${inputs.name}-${computed.formattedYear}-${inputs.showContributionColor}`}
						limit={bufferlen}
						castShadow
						receiveShadow
					>
						<boxGeometry />
						<meshStandardMaterial />
						{render()}
					</Instances>
				</group>
			)}
			<SkylineBase years={years} />
		</group>
	);
}
