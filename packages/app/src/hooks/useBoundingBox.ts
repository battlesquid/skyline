import {
	type DependencyList,
	type MutableRefObject,
	useEffect,
	useState,
} from "react";
import { Box3, type Object3D, Vector3 } from "three";

export interface BoundingBoxProps {
	obj: MutableRefObject<Object3D | null>;
	setter?: (size: Vector3) => void;
}

export const useBoundingBox = (
	props: BoundingBoxProps,
	deps: DependencyList = [],
) => {
	const { obj, setter } = props ?? {};
	const [size, setSize] = useState<Vector3>(new Vector3(0, 0, 0));
	useEffect(() => {
		if (!obj || !obj.current) {
			return;
		}
		const bb = new Box3().setFromObject(obj.current, true);
		if (setter) {
			setter(bb.getSize(new Vector3()));
		} else {
			setSize(bb.getSize(new Vector3()));
		}
	}, deps);
	return { size };
};
