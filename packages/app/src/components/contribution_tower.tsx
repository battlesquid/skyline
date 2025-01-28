import { Instance } from "@react-three/drei";
import { ContributionDay } from "../api/types";

interface ContributionTowerProps {
  x: number;
  y: number;
  day: ContributionDay;
  dampening: number;
  size: number;
}

export function ContributionTower(props: ContributionTowerProps) {
  const { x, y, day, dampening, size } = props;
  const height = day.contributionCount * size / dampening + size / dampening;

  return (
      <Instance
        scale={[size, height, size]}
        position={[x, height / 2, y]}
      />
  );
}
