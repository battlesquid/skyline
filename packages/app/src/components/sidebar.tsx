import { ActionIcon, AppShell, Button, Checkbox, ColorInput, Divider, FileButton, NumberInput, ScrollArea, Select, Stack, TextInput } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { SkylineModelParameters } from "../parameters";
import { DEFAULT_FONT_SELECTION, useFontStore, useSceneStore } from "../stores";
import { STLExporter } from "three-stdlib";

interface SidebarProps {
    authenticated: boolean;
    ok: boolean;
    setParameters: React.Dispatch<React.SetStateAction<SkylineModelParameters>>;
    parameters: SkylineModelParameters;
}

export function Sidebar(props: SidebarProps) {
    const { authenticated, ok, parameters, setParameters } = props;
    const [name, setName] = useState(parameters.name);
    const [year, setYear] = useState(parameters.year);
    const [modified, setModified] = useState(false);
    const [fontLoadFailed, setFontLoadFailed] = useState(false);
    const { scene, dirty } = useSceneStore();
    const fonts = useFontStore(state => state.fonts);
    const addFont = useFontStore(state => state.addFont);

    useEffect(() => {
        setModified(false);
    }, [ok]);

    useEffect(() => {
        if (!ok) {
            console.log(ok)
            setModified(true);
        }
    }, [name]);

    if (!authenticated) {
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
            <h2>skyline</h2>
            <ScrollArea
                style={{ height: "calc(100vh)" }}
                offsetScrollbars={true}
            >
                <Stack gap={10}>
                    <TextInput
                        label="Github Username"
                        placeholder="Github Username"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        error={ok || modified ? "" : `Unable to find profile for "${name}".`}
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
                        onClick={() => setParameters({ ...parameters, name, year })}
                    >
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
                    <NumberInput
                        label="Base Padding"
                        placeholder="Base Padding"
                        min={0}
                        step={0.5}
                        value={parameters.padding}
                        onChange={(value) => setParameters({ ...parameters, padding: parseFloat(`${value}`) })}
                    />
                    <div style={{ display: "flex", columnGap: "0.5rem" }}>
                        <Select
                            style={{ flex: 1 }}
                            label="Font"
                            data={Object.keys(fonts)}
                            defaultValue={DEFAULT_FONT_SELECTION}
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
                                {(props) => <ActionIcon size="input-sm" {...props}><IconFolder /></ActionIcon>}
                            </FileButton>
                        </Stack>
                    </div>
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
                    <Divider />
                    <Button
                        disabled={scene === null || dirty}
                        fullWidth
                        onClick={() => {
                            if (scene === null) {
                                return;
                            }
                            const clone = scene.clone();
                            clone.rotation.set(Math.PI / 2, 0, 0);
                            clone.updateMatrixWorld();
                            const exporter = new STLExporter();
                            const data = exporter.parse(clone, { binary: false });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
                            link.download = `${parameters.name}_${parameters.year}_contribution.stl`;
                            link.click();
                        }}
                    >
                        Export
                    </Button>
                </Stack>
            </ScrollArea>
        </>
    )
}