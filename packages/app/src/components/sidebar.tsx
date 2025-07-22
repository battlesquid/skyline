import {
	Accordion,
	AppShell,
	Button,
	Card,
	Center,
	Divider,
	ScrollArea,
	Stack,
	Title
} from "@mantine/core";
import { IconBrandGithubFilled, IconCube, IconDownload, IconPaint } from "@tabler/icons-react";
import { useState } from "react";
import type { UserProfile } from "../api/auth";
import accordionClasses from "../styles/accordion.module.css";
import { FontInput } from "./font_input";
import { Profile } from "./profile";
import { BasePaddingInput } from "./sidebar/base_padding";
import { BaseShapeInput } from "./sidebar/base_shape";
import { ExportButton } from "./sidebar/export";
import { FilenameInput } from "./sidebar/filename";
import { GenerateSection } from "./sidebar/generate_section";
import { RenderColorInput } from "./sidebar/render_color";
import { ScaleInput } from "./sidebar/scale";
import { TowerDampeningInput } from "./sidebar/tower_dampening";

interface SidebarProps {
	profile: UserProfile | null;
	authenticated: boolean;
	ok: boolean;
}


export function Sidebar(props: SidebarProps) {
	const { profile, authenticated, ok } = props;

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
						<GenerateSection ok={ok} login={profile?.login ?? ""} />
						<Divider />
						<Title order={5}>Settings</Title>
						<Accordion classNames={accordionClasses}>
							<Accordion.Item value="model_options">
								<Accordion.Control icon={<IconCube stroke={1} size={20} />}>
									Model
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap={10}>
										<TowerDampeningInput />
										<BasePaddingInput />
										<FontInput />
										<BaseShapeInput />
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
							<Accordion.Item value="display_options">
								<Accordion.Control icon={<IconPaint stroke={1} size={20} />}>
									Render
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap={10}>
										<RenderColorInput />
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
							<Accordion.Item value="export_options">
								<Accordion.Control icon={<IconDownload stroke={1} size={20} />}>
									Export
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap={10}>
										<ScaleInput />
										<FilenameInput />
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</Stack>
				</AppShell.Section>
				<AppShell.Section>
					<ExportButton />
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
