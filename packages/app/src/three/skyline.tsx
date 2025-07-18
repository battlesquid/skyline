import {
	Bounds,
	Environment,
	Grid,
	OrbitControls
} from "@react-three/drei";
import { Canvas, useThree, type RenderProps } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SkylineControls } from "../components/skyline_controls";
import { useControlsStore } from "../stores/controls";
import { useParametersStore } from "../stores/parameters";
import { Cameras } from "./cameras";
import { SkylineModel, type SkylineModelProps } from "./skyline_model";
import { CameraControls } from "./controls";

export type SkylineProps = Omit<SkylineModelProps, "group">;

export function Skyline(props: SkylineProps) {
	const { years } = props;
	const { parameters } = useParametersStore();
	const group = useRef<Group | null>(null);
	const style = useMemo(() => ({ height: "100%" }), []);
	const camera = useMemo<RenderProps<HTMLCanvasElement>["camera"]>(
		() => ({ position: [0, 0, 10], fov: 10 }),
		[],
	);

	const autoRotate = useControlsStore(state => state.autoRotate);
	const orthographic = useControlsStore(state => state.projectionMode === "orthographic");

	return (
		<>
			<Canvas orthographic={orthographic} id="skyline-canvas" style={style} shadows>
				<Bounds fit clip margin={1}>
					<SkylineModel group={group} years={years} />
				</Bounds>
				<ambientLight intensity={Math.PI / 2} />
				<spotLight
					castShadow
					position={[0, 20, 200]}
					angle={0.5}
					penumbra={0.1}
					decay={0.4}
					intensity={Math.PI}
				/>
				<pointLight
					castShadow
					position={[0, 40, 50]}
					decay={0}
					intensity={Math.PI}
				/>
				<directionalLight color="#fff" position={[0, 10, -50]} />
				<CameraControls />
				<Cameras />
				<Environment preset="forest" />
				<Grid
					name="grid"
					position={[0, -parameters.computed.platformHeight, 0]}
					side={DoubleSide}
					cellSize={0}
					sectionColor={"#555"}
					sectionSize={40}
					fadeDistance={10000}
					fadeStrength={10}
					fadeFrom={1}
					infiniteGrid={true}
				/>
			</Canvas>
			<SkylineControls />
		</>
	);
}
