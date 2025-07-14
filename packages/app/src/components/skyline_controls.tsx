import { ActionIcon, Affix, Stack } from "@mantine/core";
import { IconBrandGithub, IconCubeSpark, IconSettings } from "@tabler/icons-react";

export function SkylineControls() {
    return (
        <Affix m={10} top="0" left="320px">
            <Stack gap={5}>
                <ActionIcon
                    variant="light"
                    aria-label="Reset View"
                >
                    <IconCubeSpark stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                    variant="light"
                    aria-label="Settings"
                >
                    <IconSettings stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                    variant="light"
                    aria-label="Github Repository"
                >
                    <IconBrandGithub stroke={1.5} />
                </ActionIcon>
            </Stack>
        </Affix>
    )
}