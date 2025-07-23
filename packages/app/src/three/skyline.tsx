import { Bounds, Environment, Grid } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three";
import { useControlsStore } from "../stores/controls";
import { useParametersStore } from "../stores/parameters";
import { Cameras } from "./cameras";
import { CameraControls } from "./controls";
import { SkylineModel, type SkylineModelProps } from "./skyline_model";

export type SkylineProps = Omit<SkylineModelProps, "group">;

export function Skyline(props: SkylineProps) {
	const { years } = props;
	const computed = useParametersStore((state) => state.computed);
	const group = useRef<Group | null>(null);
	const style = useMemo(() => ({ height: "100%" }), []);
	const orthographic = useControlsStore(
		(state) => state.projectionMode === "orthographic",
	);
	const ready = years.length !== 0 && years[0].length !== 0;

	return (
		<Canvas
			orthographic={orthographic}
			id="skyline-canvas"
			style={style}
			shadows
		>
			<Suspense>
				<CameraControls />
				<Cameras />
				<Bounds fit={ready} clip={ready} observe={ready} margin={1}>
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
				<Environment preset="forest" />
				<Grid
					name="grid"
					position={[0, -computed.platformHeight, 0]}
					side={DoubleSide}
					cellSize={0}
					sectionColor={"#555"}
					sectionSize={40}
					fadeDistance={10000}
					fadeStrength={10}
					fadeFrom={1}
					infiniteGrid={true}
				/>
			</Suspense>
		</Canvas>
	);
}
