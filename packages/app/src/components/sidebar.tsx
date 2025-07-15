import {
	Accordion,
	ActionIcon,
	Anchor,
	AppShell,
	Box,
	Button,
	Card,
	Center,
	Checkbox,
	ColorInput,
	Divider,
	Flex,
	Group,
	NumberInput,
	Paper,
	ScrollArea,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { IconBrandGithub, IconBrandGithubFilled, IconBuildings, IconCube, IconDownload, IconPaint } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "../api/auth";
import { formatYearText } from "../api/utils";
import { useParametersStore } from "../stores/parameters";
import { useSceneStore } from "../stores/scene";
import accordionClasses from "../styles/accordion.module.css";
import { SkylineBaseShape } from "../three/skyline_base";
import { exportScene, getDimensionsText } from "../three/utils";
import { capitalize } from "../utils";
import { FontInput } from "./font_input";
import { Profile } from "./profile";

interface SidebarProps {
	profile: UserProfile | null;
	authenticated: boolean;
	ok: boolean;
}

const safeFloat = (value: string | number, min: number) => {
	if (value === "") {
		return min;
	}
	return Number.parseFloat(`${value}`);
};

const safeInt = (value: string | number, min: number) => {
	if (value === "") {
		return min;
	}
	return Number.parseInt(`${value}`);
};

export function Sidebar(props: SidebarProps) {
	const { profile, authenticated, ok } = props;
	const { parameters, setParameters } = useParametersStore();
	const [name, setName] = useState(profile?.login ?? "");
	const [startYear, setStartYear] = useState(parameters.inputs.startYear);
	const [endYear, setEndYear] = useState(parameters.inputs.endYear);
	const [scale, setScale] = useState(1);
	const [modified, setModified] = useState(false);
	const [filename, setFilename] = useState("");
	const { scene, dirty, size } = useSceneStore();

	useEffect(() => {
		setModified(false);
	}, [ok]);

	useEffect(() => {
		if (!ok) {
			setModified(true);
		}
	}, [name]);

	const defaultFilename = useMemo(() => {
		return `${parameters.inputs.name}_${formatYearText(parameters.inputs.startYear, parameters.inputs.endYear)}_skyline`;
	}, [parameters.inputs.name, parameters.inputs.startYear, parameters.inputs.endYear]);

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
		);
	}
	return (
		<Stack h={"100%"} gap={10}>
			<AppShell.Section px={6} py={4}>
				<Title order={4}>
					{import.meta.env.PUBLIC_APP_NAME}
				</Title>
			</AppShell.Section>
			<Card h="100%" p="md">
				<AppShell.Section grow component={ScrollArea} type="always" offsetScrollbars>
					<Stack gap={10}>
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
								onChange={(value) => {
									setStartYear(safeInt(value, 2015));
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
								onChange={(value) => setEndYear(safeInt(value, 2015))}
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
						<Divider />
						<Title order={5}>Settings</Title>
						<Accordion classNames={accordionClasses}>
							<Accordion.Item value="model_options">
								<Accordion.Control icon={<IconCube stroke={1} size={20} />}>
									Model
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap={10}>
										<NumberInput
											label="Tower Dampening"
											placeholder="Tower Dampening"
											min={1}
											allowDecimal={false}
											value={parameters.inputs.dampening}
											onChange={(value) =>
												setParameters({
													dampening: safeInt(value, 1),
												})
											}
										/>
										<NumberInput
											label="Base Padding"
											placeholder="Base Padding"
											min={0}
											step={0.5}
											value={parameters.inputs.padding}
											onChange={(value) =>
												setParameters({
													padding: safeFloat(value, 0),
												})
											}
										/>
										<FontInput />
										<Select
											label="Base Shape"
											data={[
												{
													value: SkylineBaseShape.Prism,
													label: capitalize(SkylineBaseShape.Prism),
												},
												{
													value: SkylineBaseShape.Frustum,
													label: capitalize(SkylineBaseShape.Frustum),
												},
											]}
											defaultValue={SkylineBaseShape.Prism}
											allowDeselect={false}
											onChange={(value) => {
												if (value === null) {
													return;
												}
												setParameters({ shape: value as SkylineBaseShape });
											}}
										/>
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
							<Accordion.Item value="display_options">
								<Accordion.Control icon={<IconPaint stroke={1} size={20} />}>
									Render
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap={10}>
										<ColorInput
											label="Render Color"
											value={parameters.inputs.color}
											disabled={parameters.inputs.showContributionColor}
											onChange={(color) => setParameters({ color })}
										/>
										<Checkbox
											label="Show Contribution Colors"
											checked={parameters.inputs.showContributionColor}
											onChange={() =>
												setParameters({
													showContributionColor:
														!parameters.inputs.showContributionColor,
												})
											}
										/>
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
							<Accordion.Item value="export_options">
								<Accordion.Control icon={<IconDownload stroke={1} size={20} />}>
									Export
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap={10}>
										<NumberInput
											label="Scale"
											placeholder="Scale"
											min={1}
											step={0.1}
											value={scale}
											onChange={(value) => setScale(safeFloat(value, 1))}
										/>
										<TextInput
											label="File Name"
											placeholder={defaultFilename}
											value={filename}
											onChange={(e) => setFilename(e.target.value)}
										/>
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</Stack>
				</AppShell.Section>
				<AppShell.Section>
					<Button
						fullWidth
						loading={scene === null || dirty}
						disabled={scene === null || dirty}
						onClick={() =>
							exportScene(
								scene,
								filename.trim() === ""
									? defaultFilename
									: filename,
							)
						}
					>
						<div>
							<Text fw={900} size="sm">
								Export
							</Text>
							<Text size="xs">{getDimensionsText(scale, size)}</Text>
						</div>
					</Button>
				</AppShell.Section>

			</Card>
			<AppShell.Section>
				<Profile profile={profile} />
			</AppShell.Section>
			<AppShell.Section>
				<Button
					component="a"
					href="https://github.com/battlesquid/skyline"
					target="_blank"
					size="xs"
					variant="default"
					leftSection={<IconBrandGithubFilled size={14} />}
					fullWidth
				>
					View on Github

				</Button>
			</AppShell.Section>
		</Stack>
	);
}
