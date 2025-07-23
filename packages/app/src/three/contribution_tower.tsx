import { Instance } from "@react-three/drei";
import { useRef } from "react";
import type { InstancedMesh } from "three";
import type { ContributionDay } from "../api/types";
import { useTowerStore } from "../stores/tower";

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
	const setPosition = useTowerStore((state) => state.setPosition);
	const setTarget = useTowerStore((state) => state.setTarget);
	return (
		<Instance
			ref={mesh}
			scale={[size, height, size]}
			position={[x, height / 2, y]}
			onPointerEnter={(e) => {
				if (mesh.current === null) {
					return;
				}
				e.stopPropagation();
				props.onPointerEnter();
				setTarget(day);
				mesh.current.geometry.attributes.color.needsUpdate = true;
			}}
			onPointerMove={(e) => {
				setPosition({ x: e.clientX, y: e.clientY });
			}}
			onPointerLeave={(e) => {
				if (mesh.current === null) {
					return;
				}
				e.stopPropagation();
				props.onPointerLeave();
				setTarget(null);
				mesh.current.geometry.attributes.color.needsUpdate = true;
			}}
		/>
	);
}
