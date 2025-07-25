import { ActionIcon, Button, Card, Center, Divider, Group, Stack, TextInput, Title, Image, Flex } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import classes from "../styles/input_button.module.css";
import { IconArrowRight } from '@tabler/icons-react';
import { Box } from '@react-three/drei';

export const Route = createFileRoute('/')({
    component: Login,
});

// todo: mess w/ isometric tower graphics

export function Login() {
    return (
        <Center h="100%">
            <Stack>
                <Title order={4}>{import.meta.env.PUBLIC_APP_NAME}</Title>
                <Card padding="xl">
                    <Flex gap={15}>
                        <Stack justify="center" gap={0}>
                            <Title>Your Contributions</Title>
                            <Title>In 3D</Title>
                        </Stack>
                        <Stack justify="center">
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
                            <TextInput
                                placeholder="Server Enterprise Host"
                                radius={9}
                                rightSection={
                                    <ActionIcon>
                                        <IconArrowRight stroke={1} />
                                    </ActionIcon>
                                }
                            />
                        </Stack>
                    </Flex>

                </Card>
            </Stack>
        </Center>
    )
}
