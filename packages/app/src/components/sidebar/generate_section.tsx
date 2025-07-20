import { NumberInput, Group, Button, TextInput } from "@mantine/core";
import { safeInt } from "../sidebar";
import { useEffect, useState } from "react";
import { useParametersStore } from "../../stores/parameters";

export interface GenerateSectionProps {
    ok: boolean;
    login: string;
}

export function GenerateSection(props: GenerateSectionProps) {
    const { ok, login } = props
    const { parameters, setInputs: setParameters } = useParametersStore();

    const [name, setName] = useState(login ?? "");
    const [startYear, setStartYear] = useState(parameters.inputs.startYear);
    const [endYear, setEndYear] = useState(parameters.inputs.endYear);
    const [modified, setModified] = useState(false);

    useEffect(() => {
        setModified(false);
    }, [ok]);

    useEffect(() => {
        if (!ok) {
            setModified(true);
        }
    }, [name]);


    return (
        <>
            <TextInput
                label="Github Username"
                placeholder="Github Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={
                    ok || modified ? "" : `Unable to find profile for "${name}".`
                }
            />
            <Group grow>
                <NumberInput
                    label="Start Year"
                    placeholder="Start Year"
                    min={2000}
                    max={new Date().getFullYear()}
                    stepHoldDelay={500}
                    stepHoldInterval={100}
                    value={startYear}
                    onBlur={() => {
                        if (startYear > endYear) {
                            setEndYear(startYear);
                        }
                    }}
                    onChange={(value) => {
                        setStartYear(safeInt(value, 2000));
                    }}
                />
                <NumberInput
                    label="End Year"
                    placeholder="End Year"
                    min={2000}
                    max={new Date().getFullYear()}
                    stepHoldDelay={500}
                    stepHoldInterval={100}
                    value={endYear}
                    onBlur={() => {
                        if (endYear < startYear) {
                            setStartYear(endYear);
                        }
                    }}
                    onChange={(value) => setEndYear(safeInt(value, 2000))}
                />
            </Group>
            <Button
                fullWidth
                onClick={() => setParameters({ name, startYear, endYear })}
                variant="light"
                size="sm"
            >
                Generate
            </Button>
        </>
    )
}