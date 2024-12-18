import { AppShell, Button, Checkbox, ColorInput, Divider, NumberInput, Stack, TextInput, Tooltip } from "@mantine/core";
import { SkylineModelParameters } from "../../App";
import { useState } from "react";

export interface GenerateOptions {
    name: string;
    year: number;
}

interface SidebarProps {
    ready: boolean;
    // onSubmit(options: GenerateOptions): void;
    setParameters: React.Dispatch<React.SetStateAction<SkylineModelParameters>>;
    parameters: SkylineModelParameters;
    onExport(): void;
}

export function Sidebar(props: SidebarProps) {
    const { ready, parameters, setParameters, onExport } = props;
    const [name, setName] = useState(parameters.name);
    const [year, setYear] = useState(parameters.year);

    if (!ready) {
        return (
            <AppShell.Section h="100%">
                <h2>skyline</h2>
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
                <Stack gap={10}>
                    <h2>skyline</h2>
                    {/* <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
        <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" /> */}
                    <TextInput
                        label="Github Username"
                        placeholder="Github Username"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <NumberInput
                        label="Year"
                        placeholder="Year"
                        min={2015}
                        max={new Date().getFullYear()}
                        stepHoldDelay={500}
                        stepHoldInterval={100}
                        value={year}
                        onChange={value => setYear(parseInt(`${value}`))}
                    />
                    <Button
                        fullWidth
                        onClick={() => {
                            setParameters({
                                ...parameters,
                                name,
                                year
                            })
                        }}>
                        Generate
                    </Button>
                    <Divider />
                    <NumberInput
                        label="Tower Size"
                        placeholder="Tower Size"
                        min={0.5}
                        step={0.1}
                        value={parameters.towerSize}
                        onChange={(value) => setParameters({ ...parameters, towerSize: parseFloat(`${value}`) })}
                    />
                    <NumberInput
                        label="Tower Dampening"
                        placeholder="Tower Dampening"
                        min={1}
                        allowDecimal={false}
                        value={parameters.towerDampening}
                        onChange={(value) => setParameters({ ...parameters, towerDampening: parseInt(`${value}`) })}
                    />
                    <Divider />
                    <ColorInput
                        label="Render Color"
                        value={parameters.color}
                        disabled={parameters.showContributionColor}
                        onChange={(color) => setParameters({ ...parameters, color })}
                    />
                    <Checkbox
                        label="Show Contribution Colors"
                        checked={parameters.showContributionColor}
                        onChange={() => setParameters({ ...parameters, showContributionColor: !parameters.showContributionColor })}
                    />
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