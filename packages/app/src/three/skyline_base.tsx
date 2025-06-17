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
import { useParametersStore } from "../stores/parameters";
import { getSvgBoundingBox } from "../utils";
import { RectangularFrustumGeometry } from "./rectangular_frustum_geometry";
import { type Dimensions, getDimensions } from "./utils";

export enum SkylineBaseShape {
	Prism = "prism",
	Frustum = "frustum",
}

export interface SkylineBaseProps {
	color: string;
	years: ContributionWeeks[];
}

export function SkylineBase(props: SkylineBaseProps) {
	const { color, years } = props;
	const parameters = useParametersStore((state) => state.parameters);

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
	}, [
		parameters.inputs.name,
		parameters.inputs.startYear,
		parameters.inputs.endYear,
		parameters.inputs.font,
		props.years,
	]);

	const [geometry, setGeometry] = useState<BufferGeometry>(
		new BoxGeometry(0, 0, 0),
	);
	const [rot, setRot] = useState(0);

	useEffect(() => {
		const width =
			parameters.computed.modelLength + parameters.computed.paddingWidth;
		const length =
			parameters.computed.modelWidth * years.length +
			parameters.computed.paddingWidth;
		const height = parameters.computed.platformHeight;

		switch (parameters.inputs.shape) {
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
	}, [parameters.inputs.shape, years, parameters]);

	const logo = useRef<Group | null>(null);
	const material = useMemo(
		() =>
			new MeshStandardMaterial({
				color: parameters.inputs.showContributionColor
					? getDefaultParameters().inputs.color
					: parameters.inputs.color,
			}),
		[parameters.inputs.color, parameters.inputs.showContributionColor],
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
		const wantedHeight = 0.65 * parameters.computed.platformHeight;
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
	const LOGO_DEPTH_OFFSET = parameters.inputs.shape === "frustum" ? 0.5 : 0;
	const TEXT_DEPTH_OFFSET = parameters.inputs.shape === "frustum" ? 2 : -0.1;

	return (
		<group>
			<group
				ref={logo}
				rotation={[rot, 0, 0]}
				position={[
					-parameters.computed.xMidpointOffset + 5,
					-parameters.computed.platformMidpoint + LOGO_Y_OFFSET,
					(parameters.computed.modelWidth * years.length) / 2 +
						parameters.inputs.padding +
						LOGO_DEPTH_OFFSET,
				]}
			/>
			<Text3D
				ref={nameRef}
				font={parameters.inputs.font}
				rotation={[rot, 0, 0]}
				receiveShadow
				castShadow
				position={[
					-parameters.computed.xMidpointOffset + nameDimensions.width / 2 + 12,
					-parameters.computed.platformMidpoint - 0.5,
					(parameters.computed.modelWidth * props.years.length) / 2 +
						parameters.inputs.padding +
						TEXT_DEPTH_OFFSET,
				]}
				height={parameters.inputs.textDepth}
				size={parameters.computed.textSize}
			>
				{parameters.inputs.name}
				<meshStandardMaterial color={color} />
			</Text3D>
			<Text3D
				ref={yearRef}
				font={parameters.inputs.font}
				receiveShadow
				castShadow
				rotation={[rot, 0, 0]}
				position={[
					parameters.computed.xMidpointOffset - yearDimensions.width / 2 - 5,
					-parameters.computed.platformMidpoint - 0.5,
					(parameters.computed.modelWidth * props.years.length) / 2 +
						parameters.computed.paddingWidth / 2 +
						TEXT_DEPTH_OFFSET,
				]}
				height={parameters.inputs.textDepth}
				size={parameters.computed.textSize}
			>
				{formatYearText(parameters.inputs.startYear, parameters.inputs.endYear)}
				<meshStandardMaterial color={color} />
			</Text3D>
			<mesh
				onPointerEnter={(e) => e.stopPropagation()}
				castShadow
				receiveShadow
				geometry={geometry}
				position={[0, -parameters.computed.platformMidpoint, 0]}
			>
				<meshStandardMaterial flatShading color={color} />
			</mesh>
		</group>
	);
}
