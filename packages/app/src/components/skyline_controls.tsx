import { ActionIcon, Card, Group, Portal, Tooltip } from "@mantine/core";
import { IconCamera, IconHome, IconRotate360 } from "@tabler/icons-react";
import classes from "../styles/dock.module.css";
import { ControlsCommand, useControlsStore } from "../stores/controls";

export function SkylineControls() {
    const setCommand = useControlsStore(state => state.setCommand);
    const toggleAutoRotation = useControlsStore(state => state.toggleAutoRotate);
    const toggleProjectionMode = useControlsStore(state => state.toggleProjectionMode);
    const autoRotate = useControlsStore(state => state.autoRotate);

    return (
        <Portal target="#skyline-canvas">
            <Card className={classes.dock} p={5} withBorder>
                <Group gap={5}>
                    <Tooltip label="Reset View">
                        <ActionIcon
                            variant="subtle"
                            aria-label="Reset View"
                            onClick={() => setCommand(ControlsCommand.Reset)}
                        >
                            <IconHome stroke={1} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Toggle Projection Mode">
                        <ActionIcon
                            variant="subtle"
                            aria-label="Toggle Camera Perspective"
                            onClick={() => toggleProjectionMode()}
                        >
                            <IconCamera stroke={1} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Toggle Rotation">
                        <ActionIcon
                            variant={autoRotate ? "filled" : "subtle"}
                            aria-label="Toggle Rotation"
                            onClick={() => toggleAutoRotation()}
                        >
                            <IconRotate360 stroke={1} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Card>
        </Portal>
    )
}