import { ActionIcon, Card, Group, Portal } from "@mantine/core";
import { IconCamera, IconHome, IconPerspective, IconReload, IconRotate360, IconSettings } from "@tabler/icons-react";
import classes from "../styles/dock.module.css";

export function SkylineControls() {
    return (
        <Portal target="#skyline-canvas">
            <Card className={classes.dock} p={5} withBorder>
                <Group gap={5}>
                    <ActionIcon
                        variant="subtle"
                        aria-label="Reset View"
                    >
                        <IconHome stroke={1} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        aria-label="Camera Perspective"
                    >
                        <IconCamera stroke={1} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        aria-label="Rotate Model"
                    >
                        <IconRotate360 stroke={1} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        aria-label="Settings"
                    >
                        <IconSettings stroke={1} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        aria-label="Settings"
                    >
                        <IconSettings stroke={1} />
                    </ActionIcon>
                </Group>
            </Card>
        </Portal>
    )
}