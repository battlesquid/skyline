import { AppShell, Stack, TextInput, NumberInput, Button, Divider, Tooltip } from "@mantine/core";
import { useRef } from "react";

export interface GenerateOptions {
    name: string;
    year: number;
}

interface SidebarProps {
    ready: boolean;
    onSubmit(options: GenerateOptions): void;
}

export function Sidebar(props: SidebarProps) {
    const username = useRef<HTMLInputElement>(null!);
    const year = useRef<HTMLInputElement>(null!);
    
    if (!props.ready) {
        return (
            <AppShell.Section h="100%">
                <Stack gap={5}>
                    <h2>skyline</h2>
                </Stack>
                <Button
                    component="a"
                    href={import.meta.env.PUBLIC_WORKER_URL}
                    fullWidth={true}
                >Login to Github</Button>
            </AppShell.Section>
        )
    }
    return (
        <>
            <AppShell.Section h="100%">
                <Stack gap={5}>
                    <h2>skyline</h2>
                    {/* <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
        <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" /> */}
                    <TextInput ref={username} label="Github Username" placeholder="Github Username" />
                    <NumberInput ref={year} min={2015} max={new Date().getFullYear()} label="Year" placeholder="Year" />
                    <Button
                        fullWidth
                        onClick={() => {
                            props.onSubmit({
                                name: username.current.value.trim(),
                                year: parseInt(year.current.value)
                            })
                        }}>
                        Generate
                    </Button>
                </Stack>
            </AppShell.Section>
            <Divider mb={10} />
            <AppShell.Section>
                <Tooltip label="Work In Progress">
                    <Button fullWidth>Export</Button>
                </Tooltip>
            </AppShell.Section>
        </>
    )
}