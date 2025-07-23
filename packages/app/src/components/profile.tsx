import {
	ActionIcon,
	Avatar,
	Box,
	Flex,
	Paper,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { logout, type UserProfile } from "../api/auth";

export interface ProfileProps {
	profile: UserProfile | null;
}

export function Profile(props: ProfileProps) {
	if (props.profile === null) {
		return null;
	}
	const { name, avatarUrl, login } = props.profile;
	return (
		<Paper p={15} withBorder>
			<Flex align="center" justify="space-between">
				<Flex align="center" gap={10}>
					<Avatar src={avatarUrl} alt={login ?? ""} />
					<Box w={"100%"}>
						<Text size="sm" fw="bold" truncate="end">
							{name}
						</Text>
						<Text size="xs" c="dimmed" truncate="end">
							{login}
						</Text>
					</Box>
				</Flex>
				<Tooltip label="Log Out">
					<ActionIcon
						onClick={() => logout()}
						variant="light"
						aria-label="Logout"
					>
						<IconLogout stroke={1} size={18} />
					</ActionIcon>
				</Tooltip>
			</Flex>
		</Paper>
	);
}
