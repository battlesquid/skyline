import { Instance } from "@react-three/drei";
import { useRef } from "react";
import { InstancedMesh } from "three";
import { ContributionDay } from "../api/types";

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
  const height = day.contributionCount * size / dampening + size / dampening;
  const mesh = useRef<InstancedMesh>(null!);

  return (
    <Instance
      ref={mesh}
      scale={[size, height, size]}
      position={[x, height / 2, y]}
      onPointerEnter={(e) => {
        e.stopPropagation();
        props.onPointerEnter();
        mesh.current.geometry.attributes.color.needsUpdate = true;
      }}
      onPointerLeave={() => {
        props.onPointerLeave();
        mesh.current.geometry.attributes.color.needsUpdate = true;
      }}
    />
  );
}
