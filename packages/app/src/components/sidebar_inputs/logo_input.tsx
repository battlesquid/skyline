import { ActionIcon, FileButton, Select, Stack } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { useState } from "react";
import { LOGOS } from "../../logos";
import { useParametersContext } from "../../stores/parameters";

export function LogoInput() {
    const setInputs = useParametersContext((state) => state.setInputs);
    const [svgLoadFailed, setSvgLoadFailed] = useState(false);

    return (
        <div style={{ display: "flex", columnGap: "0.5rem" }}>
            <Select
                style={{ flex: 1 }}
                label="Logo"
                data={Object.keys(LOGOS)}
                defaultValue={LOGOS.Circle}
                allowDeselect={false}
                onChange={(value) => {
                    if (value === null) {
                        return;
                    }
                    setInputs({ logo: LOGOS[value as keyof typeof LOGOS] });
                }}
                error={svgLoadFailed ? "Unable to load SVG" : ""}
            />
            <Stack gap={0}>
                <wbr />
                <FileButton
                    onChange={async (file) => {
                        setSvgLoadFailed(false);
                        if (file === null) {
                            return;
                        }
                        const name = file.name.split(".")[0];
                        const data = await file.text();
                        setInputs({ logo: data });
                    }}
                    accept="image/svg+xml"
                >
                    {(props) => (
                        <ActionIcon variant="light" size="input-sm" {...props}>
                            <IconFolder stroke={1} />
                        </ActionIcon>
                    )}
                </FileButton>
            </Stack>
        </div>
    );
}