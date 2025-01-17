import { Instance } from "@react-three/drei";
import { MeshProps } from "@react-three/fiber";
import { useState } from "react";
import { ContributionDay } from "../api/types";

interface ContributionTowerProps extends MeshProps {
  x: number;
  y: number;
  height: number;
  size: number;
  day: ContributionDay;
}

export function ContributionTower(props: ContributionTowerProps) {
  const { x, y, height, day, size, ...rest } = props;
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

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
      >
        {/* <meshStandardMaterial color={towerColor} roughness={0.4} /> */}

      </Instance>
      {/* <mesh
        {...rest}
        position={[x, height / 2, y]}
        onClick={(event) => {
          console.log(x, y)
          event.stopPropagation();
          click(!clicked);
        }}
        onPointerMove={(event) => {
          if (!hovered) {
            return;
          }

          event.stopPropagation();
          setPosition({ x: event.clientX, y: event.clientY });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          hover(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          hover(false);
        }}
      >
        <boxGeometry args={[size, height, size]} />
        <meshStandardMaterial color={towerColor} roughness={0.4} />
      </mesh> */}
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
