import { Canvas, MeshProps } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useQuery } from 'urql';
import { ContributionQuery } from './api/query';
import { CameraControls } from '@react-three/drei';
import './App.css';

interface BoxProps extends MeshProps {
  x: number;
  y: number;
  height: number;
}

function Box(props: BoxProps) {
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
      scale={clicked ? 1.5 : 1}
      position={[x, height / 2, y]}

      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color={hovered ? '#2e6c80' : '#4287f5'} />
    </mesh>
  )
}

export default function App() {
  const year = 2024;

  const [result] = useQuery({
    query: ContributionQuery,
    variables: {
      name: "Battlesquid",
      start: `${year}-01-01T00:00:00Z`,
      end: `${year}-12-31T00:00:00Z`
    }
  });

  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <CameraControls />
      {!result.fetching && (
        result.data?.user?.contributionsCollection.contributionCalendar.weeks.map((week, i) => (
          week.contributionDays.map((day, j) => (
            <Box key={day.date.toString()} x={i} y={j} height={day.contributionCount * 0.2 + 0.2} />
          ))
        ))
      )}
    </Canvas>
  )
}

