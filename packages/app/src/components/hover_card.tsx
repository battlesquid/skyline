import { Card, Text } from "@mantine/core";
import { useTowerStore } from "../stores/tower";
import { useEffect, useRef, useState } from "react";
import type { Dimensions } from "../three/utils";

export function HoverCard() {
    const { position, target } = useTowerStore();
    const date = target !== null
        ? new Date(target.date).toLocaleDateString(undefined, { dateStyle: 'short' })
        : "";
    const contributions = target !== null
        ? target.contributionCount
        : 0;
    const card = useRef<HTMLDivElement | null>(null);
    const [cardSize, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    useEffect(() => {
        if (card.current === null) {
            return;
        }
        setDimensions({
            width: card.current.offsetWidth,
            height: card.current.offsetHeight
        });
    }, [target]);
    let x = position.x;
    let y = position.y;
    if (card.current) {
        if (position.x >= window.innerWidth - card.current.offsetWidth) {
            x -= card.current.offsetWidth
        }
        if (position.y >= window.innerHeight - card.current.offsetHeight) {
            y -= card.current.offsetHeight
        }
    }
    return (
        <div
            ref={card}
            style={{
                opacity: target === null ? 0 : 1,
                position: 'absolute',
                left: x,
                top: y,
            }}
        >
            <Card>
                <Text fw="bold">{date}</Text>
                <Text size="sm" c="dimmed">
                    Contributions: {contributions}
                </Text>
            </Card>
        </div>
    )
}