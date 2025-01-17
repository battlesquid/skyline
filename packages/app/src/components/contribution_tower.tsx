import { Instance } from "@react-three/drei";
import { useState } from "react";
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
  const [hovered, hover] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const height = day.contributionCount * size / dampening + size / dampening;

  return (
    <>
      <Instance
        scale={[size, height, size]}
        position={[x, height / 2, y]}
        onPointerMove={(event) => {
          if (!hovered) {
            return;
          }
          event.stopPropagation();
          setPosition({ x: event.clientX, y: event.clientY });
        }}
      />
      {/* <t.In>
        {hovered && (
          <div
            key={`${x}:${y}`}
            className="animate-in"
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
            }}
          >
            <Card>
              <Text fw={500}>{new Date(day.date).toLocaleDateString(undefined, { dateStyle: "short" })}</Text>
              <Text size="sm" c="dimmed">
                Contributions: {day.contributionCount}
              </Text>
            </Card>
          </div>
        )}
      </t.In> */}
    </>
  );
}
