import { ActionIcon, Avatar, Flex, Paper, Text, useMantineTheme } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { logout, UserProfile } from "../api/auth";

export interface ProfileProps {
    profile: UserProfile | null;
}

export function Profile(props: ProfileProps) {
    if (props.profile === null) {
        return <></>
    }
    const { name, avatarUrl, login } = props.profile;
    const theme = useMantineTheme();
    return (
        <Paper p={15} style={{ backgroundColor: theme.colors.dark[8] }}>
            <Flex align="center" justify="space-between">
                <Flex align="center" gap={10}>
                    <Avatar src={avatarUrl} alt={name ?? ""} />
                    <div>
                        <Text fw="bold">{name}</Text>
                        <Text size="sm" c="dimmed">{login}</Text>
                    </div>
                </Flex>
                <ActionIcon onClick={() => logout()} variant="light" aria-label="Logout">
                    <IconLogout style={{ width: "70%", height: "70%" }} stroke={1.5} />
                </ActionIcon>
            </Flex>
        </Paper>
    );
}