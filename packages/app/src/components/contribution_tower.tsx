import { MeshProps } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

import { t } from "../App";
import { Card, Text } from "@mantine/core";
import { ResultOf } from "gql.tada";
import { ContributionQuery } from "../api/query";
import { MeshTransmissionMaterial } from "@react-three/drei";

interface ContributionTowerProps extends MeshProps {
  x: number;
  y: number;
  height: number;
  day: NonNullable<
    ResultOf<typeof ContributionQuery>["user"]
  >["contributionsCollection"]["contributionCalendar"]["weeks"][number]["contributionDays"][number];
}

export function ContributionTower(props: ContributionTowerProps) {
  const { x, y, height, day, ...rest } = props;
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

  const color = new THREE.Color(day.color);
  const towerColor = hovered ? color.multiplyScalar(1.3) : color;

  return (
    <>
      <mesh
        {...rest}
        // ref={ref}
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
        <boxGeometry args={[0.5, height, 0.5]} />
        {/* <meshStandardMaterial color={hovered ? '#2e6c80' : '#4287f5'} /> */}
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
