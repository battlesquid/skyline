import { ActionIcon, Avatar, Flex, Text } from "@mantine/core";
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
    return (
        <Flex align="center" justify="space-between">
            <Flex align="center" gap={5}>
                <Avatar src={avatarUrl} alt={name ?? ""} />
                <div>
                    <Text fw="bold">{name}</Text>
                    <Text>{login}</Text>
                </div>
            </Flex>
            <ActionIcon onClick={() => logout()} variant="filled" aria-label="Logout">
                <IconLogout style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
        </Flex>
    );
}