/**
 * Adapted from Irev-Dev
 * https://github.com/pmndrs/react-three-fiber/discussions/709#discussioncomment-2658482
 * https://codesandbox.io/p/sandbox/polished-silence-ec6v6d?file=%2Fsrc%2FApp.js%3A103%2C30
 */

import { useThree } from "@react-three/fiber"
import { useRef, useLayoutEffect } from "react"
import { PerspectiveCamera as PerspectiveCameraImpl, OrthographicCamera as OrthographicCameraImpl } from "three"
import { useControlsStore } from "../stores/controls";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";

export function Cameras() {
    const fov = 10;
    const persRef = useRef<PerspectiveCameraImpl | null>(null)
    const orthoRef = useRef<OrthographicCameraImpl | null>(null)
    const pixelsFromCenterToTop = useThree((state) => state.size.height / 2);
    const orthographic = useControlsStore(state => state.projectionMode === "orthographic");

    useLayoutEffect(() => {
        if (persRef.current === null || orthoRef.current === null) {
            return;
        }
        const pcam = persRef.current;
        const ocam = orthoRef.current;
        // convert to radians and half angle since we're only interested in the angle from the center to the top of frame
        const fovFactor = Math.tan(((fov / 2) * Math.PI) / 180) / pixelsFromCenterToTop
        const persDistanceToOrthoZoom = (distance: number) => 1 / fovFactor / distance
        const orthoZoomToPersDistance = (zoom: number) => 1 / zoom / fovFactor
        if (!pcam || !ocam || !pcam.position) return
        setTimeout(() => {
            if (orthographic) {
                ocam.position.copy(pcam.position.clone())
                ocam.zoom = persDistanceToOrthoZoom(ocam.position.length())
                ocam.updateProjectionMatrix()
            } else {
                pcam.position.copy(ocam.position.clone())
                const distance = orthoZoomToPersDistance(ocam.zoom)
                pcam.position.setLength(distance)
            }
        })
    }, [orthographic]);

    return (
        <>
            <PerspectiveCamera ref={persRef} makeDefault={!orthographic} fov={fov} />
            <OrthographicCamera ref={orthoRef} makeDefault={orthographic} />
        </>
    )
}