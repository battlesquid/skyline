import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useValidatedState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useParametersStore } from "../../stores/parameters";

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
	const [modified, setModified] = useState(false);

	const [
		{
			value: startYear,
			lastValidValue: lastValidStartYear,
			valid: startYearValid,
		},
		setStartYear,
	] = useValidatedState<string | number>(
		initialStartYear,
		(value) => {
			if (typeof value === "string" && value.trim() === "") {
				return false;
			}
			return true;
		},
		true,
	);

	const [
		{ value: endYear, lastValidValue: lastValidEndYear, valid: endYearValid },
		setEndYear,
	] = useValidatedState<string | number>(
		initialEndYear,
		(value) => {
			if (typeof value === "string" && value.trim() === "") {
				return false;
			}
			return true;
		},
		true,
	);

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
						let currentStartYear = startYear;
						if (!startYearValid && lastValidStartYear !== undefined) {
							setStartYear(lastValidStartYear);
							currentStartYear = lastValidStartYear;
						}
						if (currentStartYear > endYear) {
							setEndYear(currentStartYear);
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
					value={endYear}
					onBlur={() => {
						let currentEndYear = endYear;
						if (!endYearValid && lastValidEndYear !== undefined) {
							setEndYear(lastValidEndYear);
							currentEndYear = lastValidEndYear;
						}
						if (currentEndYear < startYear) {
							setStartYear(currentEndYear);
						}
					}}
					onChange={setEndYear}
				/>
			</Group>
			<Button
				fullWidth
				disabled={name.trim() === ""}
				onClick={() =>
					setInputs({
						name,
						startYear: startYear as number,
						endYear: endYear as number,
					})
				}
				variant="light"
				size="sm"
			>
				Generate
			</Button>
		</>
	);
}
