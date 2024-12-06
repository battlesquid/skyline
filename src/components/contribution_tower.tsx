import { MeshProps } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface ContributionTowerProps extends MeshProps {
  x: number;
  y: number;
  height: number;
}

export function ContributionTower(props: ContributionTowerProps) {
  const { x, y, height, ...rest } = props;
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

  return (
    <mesh
      {...rest}
      // ref={ref}
      position={[x, height / 2, y]}

      onClick={(event) => {
        event.stopPropagation();
        console.log(x, y)
        click(!clicked)
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        hover(false)
      }}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color={hovered ? '#2e6c80' : '#4287f5'} />
    </mesh>
  )
}
