import { Accordion, ActionIcon, Anchor, AppShell, Button, Center, Checkbox, ColorInput, Divider, FileButton, Group, HoverCard, NumberInput, ScrollArea, Select, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { IconCube, IconDeviceDesktop, IconDownload, IconFolder, IconHelp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { DEFAULT_FONT_SELECTION } from "../defaults";
import { exportScene } from "../export_scene";
import { UserProfile } from "../api/loadProfile";
import { useFontStore, useParametersStore, useSceneStore } from "../stores";
import accordionClasses from '../styles/accordion.module.css';
import { Profile } from "./profile";

interface SidebarProps {
    profile?: UserProfile;
    authenticated: boolean;
    ok: boolean;
}

const getDimensionsText = (scale: number, size: Vector3) => {
    return `${Math.round(size.x * scale)}mm × ${Math.round(size.y * scale)}mm × ${Math.round(size.z * scale)}mm`
}

const safeFloat = (value: string | number, min: number) => {
    if (value === "") {
        return min;
    }
    return parseFloat(`${value}`);
}

const safeInt = (value: string | number, min: number) => {
    if (value === "") {
        return min;
    }
    return parseInt(`${value}`);
}

export function Sidebar(props: SidebarProps) {
    const { profile, authenticated, ok } = props;
    const { parameters, setParameters } = useParametersStore();
    const [name, setName] = useState(profile?.name ?? parameters.name);
    const [startYear, setStartYear] = useState(parameters.startYear);
    const [endYear, setEndYear] = useState(parameters.endYear);
    const [scale, setScale] = useState(1);
    const [modified, setModified] = useState(false);
    const [fontLoadFailed, setFontLoadFailed] = useState(false);
    const { scene, dirty, size } = useSceneStore();
    const fonts = useFontStore(state => state.fonts);
    const addFont = useFontStore(state => state.addFont);

    useEffect(() => {
        setModified(false);
    }, [ok]);

    useEffect(() => {
        if (!ok) {
            setModified(true);
        }
    }, [name]);

    if (!authenticated) {
        return (
            <AppShell.Section grow>
                <Stack h="100%" justify="center">
                    <Center>
                        <h2>{import.meta.env.PUBLIC_APP_NAME}</h2>
                    </Center>
                    <Divider />
                    <Button
                        component="a"
                        href={import.meta.env.PUBLIC_WORKER_URL}
                        fullWidth={true}
                    >
                        Login to Github
                    </Button>
                    <Button
                        component="a"
                        href={import.meta.env.PUBLIC_WORKER_ENTERPRISE_URL}
                        fullWidth={true}
                    >
                        Login to Github (Enterprise)
                    </Button>
                </Stack>
            </AppShell.Section>
        )
    }
    return (
        <>
            <AppShell.Section>
                <Title my={5} order={4}>{import.meta.env.PUBLIC_APP_NAME}</Title>
            </AppShell.Section>
            <Divider p={5} />
            <AppShell.Section
                grow
                component={ScrollArea}
                type="always"
            >
                <Stack gap={10}>
                    <TextInput
                        label="Github Username"
                        placeholder="Github Username"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        error={ok || modified ? "" : `Unable to find profile for "${name}".`}
                    />
                    <Group grow>
                        <NumberInput
                            label="Start Year"
                            placeholder="Start Year"
                            min={2015}
                            max={new Date().getFullYear()}
                            stepHoldDelay={500}
                            stepHoldInterval={100}
                            value={startYear}
                            onBlur={() => {
                                if (startYear > endYear) {
                                    setEndYear(startYear);
                                }
                            }}
                            onChange={value => {
                                setStartYear(safeInt(value, 2015))
                            }}
                        />
                        <NumberInput
                            label="End Year"
                            placeholder="End Year"
                            min={2015}
                            max={new Date().getFullYear()}
                            stepHoldDelay={500}
                            stepHoldInterval={100}
                            value={endYear}
                            onBlur={() => {
                                if (endYear < startYear) {
                                    setStartYear(endYear);
                                }
                            }}
                            onChange={value => setEndYear(safeInt(value, 2015))}
                        />
                    </Group>
                    <Button
                        fullWidth
                        onClick={() => setParameters({ ...parameters, name, startYear, endYear })}
                        variant="light"
                    >
                        Generate
                    </Button>
                    <Divider />
                    <Title order={4}>Settings</Title>
                    <Accordion classNames={accordionClasses}>
                        <Accordion.Item value="model_options">
                            <Accordion.Control icon={<IconCube size={20} />}>
                                Model
                            </Accordion.Control>
                            <Accordion.Panel>
                                <NumberInput
                                    label="Tower Dampening"
                                    placeholder="Tower Dampening"
                                    min={1}
                                    allowDecimal={false}
                                    value={parameters.dampening}
                                    onChange={(value) => setParameters({ ...parameters, dampening: safeInt(value, 1) })}
                                />
                                <NumberInput
                                    label="Base Padding"
                                    placeholder="Base Padding"
                                    min={0}
                                    step={0.5}
                                    value={parameters.padding}
                                    onChange={(value) => setParameters({ ...parameters, padding: safeFloat(value, 0) })}
                                />
                                <div style={{ display: "flex", columnGap: "0.5rem" }}>
                                    <Select
                                        style={{ flex: 1 }}
                                        label={
                                            <Group gap={5}>
                                                Font
                                                <HoverCard>
                                                    <HoverCard.Target>
                                                        <ThemeIcon size={16} radius={"lg"} variant="light">
                                                            <IconHelp size={16} />
                                                        </ThemeIcon>
                                                    </HoverCard.Target>
                                                    <HoverCard.Dropdown>
                                                        <Text size="sm">Must be a valid <Anchor href="https://gero3.github.io/facetype.js/" target="_blank">typeface.js</Anchor> font.</Text>
                                                    </HoverCard.Dropdown>
                                                </HoverCard>
                                            </Group>
                                        }
                                        data={Object.keys(fonts)}
                                        defaultValue={DEFAULT_FONT_SELECTION}
                                        allowDeselect={false}
                                        onChange={value => {
                                            if (value === null) {
                                                return;
                                            }
                                            setParameters({ ...parameters, font: fonts[value] });
                                        }}
                                        error={fontLoadFailed ? "Unable to load font" : ""}
                                    />
                                    <Stack gap={0}>
                                        <wbr />
                                        <FileButton
                                            onChange={async (file) => {
                                                setFontLoadFailed(false);
                                                if (file === null) {
                                                    return;
                                                }
                                                const name = file.name.split(".")[0];
                                                const data = await file.text();
                                                try {
                                                    setFontLoadFailed(!addFont(name, JSON.parse(data)));
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            accept="application/json"
                                        >
                                            {(props) => <ActionIcon variant="light" size="input-sm" {...props}><IconFolder /></ActionIcon>}
                                        </FileButton>
                                    </Stack>
                                </div>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="display_options">
                            <Accordion.Control icon={<IconDeviceDesktop size={20} />}>
                                Render
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap={10}>
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
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="export_options">
                            <Accordion.Control icon={<IconDownload size={20} />}>
                                Export
                            </Accordion.Control>
                            <Accordion.Panel>
                                <NumberInput
                                    label="Scale"
                                    placeholder="Scale"
                                    min={1}
                                    step={0.1}
                                    value={scale}
                                    onChange={(value) => setScale(safeFloat(value, 1))}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Stack>
            </AppShell.Section>
            <AppShell.Section pb={10}>
                <Button
                    variant="light"
                    size="md"
                    fullWidth
                    loading={scene === null || dirty}
                    disabled={scene === null || dirty}
                    onClick={() => exportScene(scene, `${parameters.name}_${parameters.startYear}_contribution`)}
                >
                    <div>
                        <Text fw={900} size="sm">
                            Export
                        </Text>
                        <Text size="xs">
                            {getDimensionsText(scale, size)}
                        </Text>
                    </div>
                </Button>
            </AppShell.Section>
            <Divider py={5} />
            <AppShell.Section>
                <Profile profile={profile} />
            </AppShell.Section>
        </>
    )
}