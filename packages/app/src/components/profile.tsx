import {
	ActionIcon,
	Avatar,
	Flex,
	Paper,
	Text,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { type UserProfile, logout } from "../api/auth";

export interface ProfileProps {
	profile: UserProfile | null;
}

export function Profile(props: ProfileProps) {
	if (props.profile === null) {
		return <></>;
	}
	const { name, avatarUrl, login } = props.profile;
	const theme = useMantineTheme();
	return (
		<Paper p={15} style={{ backgroundColor: theme.colors.dark[8] }}>
			<Flex align="center" justify="space-between">
				<Flex align="center" gap={10}>
					<Avatar src={avatarUrl} alt={name ?? ""} />
					<div>
						<Text size="sm" fw="bold">
							{name}
						</Text>
						<Text size="xs" c="dimmed">
							{login}
						</Text>
					</div>
				</Flex>
				<Tooltip label="Log Out">
					<ActionIcon
						onClick={() => logout()}
						variant="light"
						aria-label="Logout"
					>
						<IconLogout stroke={1.5} />
					</ActionIcon>
				</Tooltip>
			</Flex>
		</Paper>
	);
}
