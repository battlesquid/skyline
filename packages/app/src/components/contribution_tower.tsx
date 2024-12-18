import { MeshProps } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";
import { Card, Text } from "@mantine/core";
import { ResultOf } from "gql.tada";
import { ContributionQuery } from "../api/query";
import { t } from "../App";

interface ContributionTowerProps extends MeshProps {
  x: number;
  y: number;
  height: number;
  size: number;
  defaultColor: string;
  showContributionColor: boolean;
  day: NonNullable<
    ResultOf<typeof ContributionQuery>["user"]
  >["contributionsCollection"]["contributionCalendar"]["weeks"][number]["contributionDays"][number];
}

export function ContributionTower(props: ContributionTowerProps) {
  const { x, y, height, day, size, showContributionColor, defaultColor, ...rest } = props;
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const color = showContributionColor ?
    new THREE.Color(day.color)
    : new THREE.Color(defaultColor);
  const towerColor = hovered ? color.multiplyScalar(1.3) : color;

  return (
    <>
      <mesh
        {...rest}
        position={[x, height / 2, y]}
        onClick={(event) => {
          event.stopPropagation();
          console.log(x, y);
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
      </mesh>
      <t.In>
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
      </t.In>
    </>
  );
}
