import { Instance } from "@react-three/drei";
import { ContributionDay } from "../api/types";
import { useTowerStore } from "../stores";
import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

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
  const { setTargetDay, setTargetDayPos } = useTowerStore();
  const [hovered, setHovered] = useState(false);

  useDebounce(
    {
      beforeDebounceInit: () => {
        if (!hovered) {
          setTargetDay(null);
        }
      },
      onDebounce: () => {
        if (hovered) {
          setTargetDay(day);
        }
      }
    },
    500,
    [hovered]
  );

  return (
    <Instance
      scale={[size, height, size]}
      position={[x, height / 2, y]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false)
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        setTargetDayPos(event.clientX, event.clientY);
      }}
    />
  );
}
