import { useRef } from "react"
import { Brush, Evaluator } from "three-bvh-csg"

export interface UseCsgProps {
    
}

export const useCsg = () => {
    const brush1 = useRef(new Brush());
    const brush2 = useRef(new Brush());
    const evaluator = useRef(new Evaluator());
}