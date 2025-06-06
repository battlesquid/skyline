import { Instance } from "@react-three/drei";
import { useRef } from "react";
import type { InstancedMesh } from "three";
import type { ContributionDay } from "../api/types";

interface ContributionTowerProps {
	x: number;
	y: number;
	day: ContributionDay;
	dampening: number;
	size: number;
	onPointerEnter: () => void;
	onPointerLeave: () => void;
}

export function ContributionTower(props: ContributionTowerProps) {
	const { x, y, day, dampening, size } = props;
	const height = (day.contributionCount * size) / dampening;
	const mesh = useRef<InstancedMesh | null>(null);

	return (
		<Instance
			ref={mesh}
			scale={[size, height, size]}
			position={[x, height / 2, y]}
			onPointerEnter={(e) => {
				e.stopPropagation();
				props.onPointerEnter();
				if (mesh.current === null) {
					return;
				}
				mesh.current.geometry.attributes.color.needsUpdate = true;
			}}
			onPointerLeave={() => {
				props.onPointerLeave();
				if (mesh.current === null) {
					return;
				}
				mesh.current.geometry.attributes.color.needsUpdate = true;
			}}
		/>
	);
}
