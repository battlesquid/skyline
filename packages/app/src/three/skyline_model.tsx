import { useBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { type MutableRefObject, useEffect } from "react";
import { type Group } from "three";
import type {
	ContributionWeeks
} from "../api/types";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useParametersStore } from "../stores/parameters";
import { useSceneStore } from "../stores/scene";
import { SkylineBase } from "./skyline_base";
import { SkylineTowers } from "./skyline_towers";

export interface SkylineModelProps {
	group: MutableRefObject<Group | null>;
	years: ContributionWeeks[];
}

export function SkylineModel(props: SkylineModelProps) {
	const { group, years } = props;
	const { parameters } = useParametersStore();

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
		parameters.inputs.dampening,
		parameters.inputs.name,
		parameters.inputs.startYear,
		parameters.inputs.endYear,
		parameters.inputs.padding,
		parameters.inputs.font,
		parameters.inputs.shape,
	]);

	useBoundingBox(
		{
			obj: group,
			setter: (bb) => sceneStore.setSize(bb),
		},
		[parameters, years],
	);

	const renderColor = parameters.inputs.showContributionColor
		? getDefaultParameters().inputs.color
		: parameters.inputs.color;

	return (
		<group ref={group}>
			<group name="export_group" />
			{years.length > 0 && years[0].length > 0 && (<SkylineTowers years={years} />)}
			<SkylineBase color={renderColor} years={years} />
		</group>
	);
}
