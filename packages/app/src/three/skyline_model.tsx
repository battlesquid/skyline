import { Instances, useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import { Color, type Group as ThreeGroup } from "three";
import type {
	ContributionDay,
	ContributionWeek,
	ContributionWeeks,
} from "../api/types";
import { calculateFirstDayOffset } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { ControlsCommand, useControlsStore } from "../stores/controls";
import { useParametersStore } from "../stores/parameters";
import { useSceneStore } from "../stores/scene";
import { ContributionTower } from "./contribution_tower";
import { SkylineBase } from "./skyline_base";

export interface SkylineModelProps {
	group: MutableRefObject<ThreeGroup | null>;
	years: ContributionWeeks[];
}

export function SkylineModel(props: SkylineModelProps) {
	const { group, years } = props;
	const { parameters } = useParametersStore();

	const scene = useThree((state) => state.scene);
	const setDirty = useSceneStore(state => state.setDirty);
	const setSize = useSceneStore(state => state.setSize);
	const setScene = useSceneStore(state => state.setScene);

	const command = useControlsStore(state => state.command);
	const clearCommand = useControlsStore(state => state.clearCommand);

	const bounds = useBounds();
	let boundsTimeout: number | undefined = undefined;
	useEffect(() => {
		if (boundsTimeout !== undefined) {
			clearTimeout(boundsTimeout);
		}
		setDirty(true);
		boundsTimeout = setTimeout(() => {
			if (group.current === null) {
				return;
			}
			setScene(scene.clone());
			bounds.refresh(group.current).clip().fit().reset();
			setDirty(false);
		}, 1500);

		return () => {
			if (boundsTimeout !== undefined) {
				clearTimeout(boundsTimeout);
			}
		};
	}, [
		parameters.inputs.dampening,
		parameters.inputs.name,
		parameters.inputs.startYear,
		parameters.inputs.endYear,
		parameters.inputs.padding,
		parameters.inputs.font,
		parameters.inputs.shape,
	]);

	useEffect(() => {
		if (command === null) {
			return;
		}
		switch (command) {
			case ControlsCommand.Reset:
				bounds.refresh().clip().fit().reset();
				break;
			case ControlsCommand.TogglePerspective:
				break;
			case ControlsCommand.ToggleRotate:
				break;
			default:
				((_: never) => { })(command);
				break;
		}
		clearCommand();
	}, [command]);

	useBoundingBox(
		{
			obj: group,
			setter: setSize,
		},
		[parameters, years],
	);

	const id = useRef<number>(0);
	const tempColor = new Color();
	const multColor = new Color();

	const renderColor = parameters.inputs.showContributionColor
		? getDefaultParameters().inputs.color
		: parameters.inputs.color;

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
		if (day.contributionCount === 0) {
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
			: defaultColors.raw[idx].getHex();
		const highlight = multColor.set(highlightBase).multiplyScalar(1.6).getHex();
		return (
			<ContributionTower
				key={day.date.toString()}
				day={day}
				x={
					weekIdx * parameters.inputs.towerSize -
					parameters.computed.xMidpointOffset +
					parameters.computed.towerSizeOffset
				}
				y={
					centerOffset +
					YEAR_OFFSET +
					((dayIdx + weekOffset) * parameters.inputs.towerSize -
						parameters.computed.yMidpointOffset +
						parameters.computed.towerSizeOffset)
				}
				size={getDefaultParameters().inputs.towerSize}
				dampening={parameters.inputs.dampening}
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
			<group name="export_group" />
			{years.length > 0 && years[0].length > 0 && (
				<group name="instances_group">
					<Instances
						castShadow
						receiveShadow
						name="instances"
						key={`${years.length}-${parameters.inputs.showContributionColor}`}
						limit={contributionColors.instanced.length}
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
						{render()}
					</Instances>
				</group>
			)}
			<SkylineBase color={renderColor} years={years} />
		</group>
	);
}
