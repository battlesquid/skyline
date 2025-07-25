import { Button, Card, Center, Divider, Stack, Tabs, Text, TextInput, Title } from '@mantine/core'
import { IconPhoto, IconMessageCircle, IconSettings } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Login,
})

export function Login() {
    return (
        <Center h="100%">
            <Stack>
                <Title order={4}>{import.meta.env.PUBLIC_APP_NAME}</Title>
                <Card padding="xl">
                    <Stack>
                        <Button
                            component="a"
                            href={import.meta.env.PUBLIC_WORKER_URL}
                            fullWidth={true}
                        >
                            Login to Github
                        </Button>
                        <Divider my="xs" label="OR" labelPosition="center" />
                        <Button
                            component="a"
                            href={import.meta.env.PUBLIC_WORKER_ENTERPRISE_URL}
                            fullWidth={true}
                        >
                            Login to Github (Enterprise)
                        </Button>
                        <TextInput
                        />
                    </Stack>
                </Card>
            </Stack>
        </Center>
    )
}
