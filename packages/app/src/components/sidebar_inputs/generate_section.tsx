import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParametersStore } from "../../stores/parameters";
import { safeInt } from "../../utils";

export interface GenerateSectionProps {
	ok: boolean;
	login: string;
}

export function GenerateSection(props: GenerateSectionProps) {
	const { ok, login } = props;
	const initialStartYear =
		useParametersStore.getInitialState().inputs.startYear;
	const initialEndYear = useParametersStore.getInitialState().inputs.endYear;
	const setInputs = useParametersStore((state) => state.setInputs);

	const [name, setName] = useState(login ?? "");
	const [startYear, setStartYear] = useState(initialStartYear);
	const [endYear, setEndYear] = useState(initialEndYear);
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
				error={ok || modified ? "" : `Unable to find profile for "${name}".`}
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
				onClick={() => setInputs({ name, startYear, endYear })}
				variant="light"
				size="sm"
			>
				Generate
			</Button>
		</>
	);
}
