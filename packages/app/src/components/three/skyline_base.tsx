import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { BufferGeometryUtils, FontLoader } from "three/examples/jsm/Addons.js";

interface SkylineBaseProps {
    username: string;
    year: string;
    length: number;
    width: number;
    height: number;
    padding: number;
    font: string;
}

export function SkylineBase(props: SkylineBaseProps) {
    // const font = useFont(props.font);
    const font = useLoader(FontLoader, "/Inter_Bold.json");

    const geometry = new THREE.BufferGeometry();

    const username = new TextGeometry(props.username, {
        font
    })

    const year = new TextGeometry(props.username, {
        font
    })
    
    const base = new THREE.BoxGeometry(
        props.length + props.padding,
        props.height,
        props.width + props.padding
    );

    
    const geometries = [
        base
    ]

    const merged = BufferGeometryUtils.mergeGeometries(geometries)
}