import {
    type DependencyList,
    type MutableRefObject,
    useEffect,
    useState,
} from "react";
import { Box3, Mesh, type Object3D, Vector3 } from "three";
import { isNullish } from "../utils";

export interface BoundingBoxProps {
    obj: MutableRefObject<Object3D | null> | undefined;
    setter?: (size: Vector3) => void;
}

export const getThreeBoundingBox = (obj: Object3D) => new Box3().setFromObject(obj, true).getSize(new Vector3());

export const useBoundingBox = (
    props: BoundingBoxProps,
    deps: DependencyList = [],
) => {
    const { obj, setter } = props ?? {};
    const [size, setSize] = useState<Vector3>(new Vector3(0, 0, 0));
    useEffect(() => {
        if (isNullish(obj) || isNullish(obj.current)) {
            return;
        }
		const copy = obj.current.clone();
		copy.rotation.set(0, 0, 0);
        if (copy instanceof Mesh) {
            copy.geometry.computeBoundingBox();
            copy.geometry.center();
        }
        const bb = getThreeBoundingBox(copy);
        if (setter) {
            setter(bb);
        } else {
            setSize(bb);
        }
    }, [obj, ...deps]);
    return { size };
};
