import { Text3D } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	BoxGeometry,
	type BufferGeometry,
	type Group,
	type Mesh,
	MeshStandardMaterial,
} from "three";
import type { ContributionWeeks } from "../api/types";
import { formatYearText } from "../api/utils";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useSvgMesh } from "../hooks/useSvgMesh";
import { LOGOS } from "../logos";
import { useParametersContext } from "../stores/parameters";
import { getSvgBoundingBox } from "../utils";
import { RectangularFrustumGeometry } from "./rectangular_frustum_geometry";
import { SkylineBaseShape } from "./types";
import { type Dimensions, getDimensions } from "./utils";

export interface SkylineBaseProps {
	color: string;
	years: ContributionWeeks[];
}

export function SkylineBase(props: SkylineBaseProps) {
	const { color, years } = props;
	const inputs = useParametersContext((state) => state.inputs);
	const computed = useParametersContext((state) => state.computed);

	const yearRef = useRef<Mesh | null>(null);
	const nameRef = useRef<Mesh | null>(null);

	const [yearDimensions, setYearDimensions] = useState<Dimensions>({
		width: 0,
		height: 0,
	});
	const [nameDimensions, setNameDimensions] = useState<Dimensions>({
		width: 0,
		height: 0,
	});
	useEffect(() => {
		if (nameRef.current === null || yearRef.current === null) {
			return;
		}
		setNameDimensions(getDimensions(nameRef.current));
		setYearDimensions(getDimensions(yearRef.current));
	}, [inputs.name, inputs.startYear, inputs.endYear, inputs.font, props.years, inputs.nameOverride]);

	const [geometry, setGeometry] = useState<BufferGeometry>(
		new BoxGeometry(0, 0, 0),
	);
	const [rot, setRot] = useState(0);

	useEffect(() => {
		const width = computed.modelLength + computed.paddingWidth;
		const length = computed.modelWidth * years.length + computed.paddingWidth;
		const height = computed.platformHeight;

		switch (inputs.shape) {
			case SkylineBaseShape.Prism:
				setGeometry(new BoxGeometry(width, height, length));
				setRot(0);
				break;
			case SkylineBaseShape.Frustum: {
				const geom = new RectangularFrustumGeometry(width, length, height);
				setGeometry(geom);
				setRot(geom.calculateSlopeAngle());
				break;
			}
		}
	}, [inputs.shape, years, computed]);

	const logo = useRef<Group | null>(null);
	const material = useMemo(
		() =>
			new MeshStandardMaterial({
				color: inputs.showContributionColor
					? getDefaultParameters().inputs.color
					: inputs.color,
			}),
		[inputs.color, inputs.showContributionColor],
	);

	const { meshes } = useSvgMesh(LOGOS.Circle, material);
	useEffect(() => {
		if (logo.current === null) {
			return;
		}
		logo.current.clear();
		for (const mesh of meshes) {
			logo.current?.add(mesh);
		}
		const wantedHeight = 0.65 * computed.platformHeight;
		const { height } = getSvgBoundingBox(LOGOS.Circle);

		const scale = wantedHeight / height;
		logo.current.scale.set(scale, -scale, scale);
	}, [logo.current, meshes]);

	const { size } = useBoundingBox(
		{
			obj: logo,
		},
		[logo.current, meshes],
	);
	const LOGO_Y_OFFSET = size.y / 2;
	const LOGO_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : 0;
	const TEXT_DEPTH_OFFSET = inputs.shape === "frustum" ? 2 : -0.1;

	return (
		<group>
			<group
				ref={logo}
				rotation={[rot, 0, 0]}
				position={[
					-computed.xMidpointOffset + 5,
					-computed.platformMidpoint + LOGO_Y_OFFSET,
					(computed.modelWidth * years.length) / 2 +
						inputs.padding +
						LOGO_DEPTH_OFFSET,
				]}
			/>
			<Text3D
				ref={nameRef}
				font={inputs.font}
				rotation={[rot, 0, 0]}
				receiveShadow
				castShadow
				position={[
					-computed.xMidpointOffset + nameDimensions.width / 2 + 12,
					-computed.platformMidpoint - 0.5,
					(computed.modelWidth * props.years.length) / 2 +
						inputs.padding +
						TEXT_DEPTH_OFFSET,
				]}
				height={inputs.textDepth}
				size={computed.textSize}
			>
				{inputs.nameOverride.trim() !== "" ? inputs.nameOverride : inputs.name}
				<meshStandardMaterial color={color} />
			</Text3D>
			<Text3D
				ref={yearRef}
				font={inputs.font}
				receiveShadow
				castShadow
				rotation={[rot, 0, 0]}
				position={[
					computed.xMidpointOffset - yearDimensions.width / 2 - 5,
					-computed.platformMidpoint - 0.5,
					(computed.modelWidth * props.years.length) / 2 +
						computed.paddingWidth / 2 +
						TEXT_DEPTH_OFFSET,
				]}
				height={inputs.textDepth}
				size={computed.textSize}
			>
				{formatYearText(inputs.startYear, inputs.endYear)}
				<meshStandardMaterial color={color} />
			</Text3D>
			<mesh
				onPointerEnter={(e) => e.stopPropagation()}
				castShadow
				receiveShadow
				geometry={geometry}
				position={[0, -computed.platformMidpoint, 0]}
			>
				<meshStandardMaterial flatShading color={color} />
			</mesh>
		</group>
	);
}
