import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParametersStore } from "../../stores/parameters";
import { safeInt } from "../../utils";
import { useValidatedState } from "@mantine/hooks";

export interface GenerateSectionProps {
    ok: boolean;
    login: string;
}

const MIN_START_YEAR = 2000;

export function GenerateSection(props: GenerateSectionProps) {
    const { ok, login } = props;
    const initialStartYear =
        useParametersStore.getInitialState().inputs.startYear;
    const initialEndYear = useParametersStore.getInitialState().inputs.endYear;
    const setInputs = useParametersStore((state) => state.setInputs);

    const [name, setName] = useState(login ?? "");
    // const [startYear, setStartYear] = useState<number | string>(initialStartYear);
    // const [endYear, setEndYear] = useState<number | string>(initialEndYear);
    const [modified, setModified] = useState(false);

    const [
        {
            value: startYear,
            lastValidValue: lastValidStartYear,
            valid: startYearValid
        },
        setStartYear
    ] = useValidatedState<string | number>(
        initialStartYear,
        (value) => {
            if (typeof value === "string" && value.trim() === "") {
                return false;
            }
            return true;
        }
    )

        const [
        {
            value: endYear,
            lastValidValue: lastValidEndYear,
            valid: endYearValid
        },
        setEndYear
    ] = useValidatedState<string | number>(
        initialEndYear,
        (value) => {
            if (typeof value === "string" && value.trim() === "") {
                return false;
            }
            return true;
        }
    )

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
                error={ok || modified ? "" : `Unable to find profile for "${name}".`}
            />
            <Group grow>
                <NumberInput
                    label="Start Year"
                    placeholder="Start Year"
                    min={MIN_START_YEAR}
                    max={new Date().getFullYear()}
                    stepHoldDelay={500}
                    stepHoldInterval={100}
                    value={startYear}
                    onBlur={() => {
                        if (startYear > endYear) {
                            setEndYear(startYear);
                        }
                        if (!startYearValid && lastValidStartYear !== undefined) {
                            setStartYear(lastValidStartYear)
                        }
                    }}
                    onChange={setStartYear}
                />
                <NumberInput
                    label="End Year"
                    placeholder="End Year"
                    min={MIN_START_YEAR}
                    max={new Date().getFullYear()}
                    stepHoldDelay={500}
                    stepHoldInterval={100}
                    value={lastValidEndYear}
                    onBlur={() => {
                        if (endYear < startYear) {
                            setStartYear(endYear);
                        }
                                 if (!endYearValid && lastValidStartYear !== undefined) {
                            setStartYear(lastValidStartYear)
                        }
                    }}
                    onChange={setEndYear}
                />
            </Group>
            <Button
                fullWidth
                disabled={name.trim() === ""}
                onClick={() => setInputs({ name, startYear, endYear })}
                variant="light"
                size="sm"
            >
                Generate
            </Button>
        </>
    );
}
