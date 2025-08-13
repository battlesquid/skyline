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
        if (obj.current instanceof Mesh) {
            obj.current.geometry.center();
            obj.current.geometry.computeBoundingBox();
        }
        const bb = getThreeBoundingBox(obj.current);
        if (setter) {
            setter(bb);
        } else {
            setSize(bb);
        }
    }, [obj, ...deps]);
    return { size };
};
