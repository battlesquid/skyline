import { ActionIcon, Affix, Box, Button, Center, Divider, Flex, LoadingOverlay, Stack, Tabs, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconBrandGithubFilled } from "@tabler/icons-react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { isAuthenticated, resolveToken } from "../api/auth";
import "../styles/login.css";

type LoginSearchParams = {
    code?: string;
    redirect?: string;
}

export const Route = createFileRoute('/login')({
    component: Login,
    beforeLoad: ({ search }) => {
        if (isAuthenticated()) {
            throw redirect({
                to: search.redirect ?? "/",
                reloadDocument: true,
                replace: true
            });
        }
    },
    validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
        return {
            code: (search.code as string) ?? undefined,
            redirect: (search.redirect as string) ?? undefined
        }
    }
});



function Login() {
    const router = useRouter();
    const { code } = Route.useSearch();
    const loading = useRef<boolean | null>(null);

    useEffect(() => {
        const handleRedirect = async (code: string) => {
            await resolveToken(code);
            await router.invalidate();
        }
        if (code !== undefined && !loading.current) {
            loading.current = true;
            handleRedirect(code);
        }
    }, []);

    const _3D = (
        <span style={{
            fontWeight: 900,
            color: "var(--mantine-color-pink-5)",
            textShadow: `
                  0px 1px 0px var(--mantine-color-pink-7), 
                  0px 2px 0px var(--mantine-color-pink-7), 
                  0px 3px 0px var(--mantine-color-pink-7)`
        }}
        >
            3D
        </span>
    );

    return (
        <>
            <LoadingOverlay visible={loading.current ?? false} zIndex={1000} overlayProps={{ radius: "sm" }} loaderProps={{ type: "bars" }} />
            <Center h="100%">
                <Flex gap={20}>
                    <Center>
                        <Stack gap={0}>
                            <Title order={4}>{import.meta.env.PUBLIC_APP_NAME}</Title>
                            <Title>Your Contribution</Title>
                            <Title>Story in {_3D}</Title>
                        </Stack>
                    </Center>
                    <Divider orientation="vertical" />
                    <Box miw={400}>
                        <Center mb={5}>
                            <Title order={4}>Login</Title>
                        </Center>
                        <Box miw={200} mih={200}>
                            <Tabs defaultValue="public">
                                <Tabs.List grow>
                                    <Tabs.Tab value="public">Free, Pro, & Team</Tabs.Tab>
                                    <Tabs.Tab value="enterprise">Enterprise</Tabs.Tab>
                                </Tabs.List>
                                <Tabs.Panel value="public" p={10}>
                                    <Button
                                        component="a"
                                        href={import.meta.env.PUBLIC_WORKER_URL}
                                        fullWidth={true}
                                    >
                                        Login to Github
                                    </Button>
                                </Tabs.Panel>
                                <Tabs.Panel p={10} value="enterprise">
                                    <Stack justify="center" gap={5}>
                                        <Button
                                            component="a"
                                            href={import.meta.env.PUBLIC_WORKER_ENTERPRISE_URL}
                                            fullWidth={true}
                                        >
                                            Login to Cloud Enterprise
                                        </Button>
                                        <Divider p={10} label="Or continue with Server Enterprise" />
                                        <TextInput
                                            placeholder="Server Enterprise URL"
                                            radius={9}
                                            rightSection={
                                                <ActionIcon>
                                                    <IconArrowRight stroke={1} />
                                                </ActionIcon>
                                            }
                                        />
                                    </Stack>
                                </Tabs.Panel>
                            </Tabs>
                        </Box>
                    </Box>
                </Flex>

                <Affix position={{ bottom: 15, right: 15 }}>
                    <Button
                        component="a"
                        c="dimmed"
                        size="compact-xs"
                        variant="transparent"
                        href="https://github.com/battlesquid/skyline"
                        target="_blank"
                        leftSection={<IconBrandGithubFilled size={18} />}
                    >
                        View on Github
                    </Button>
                </Affix>
            </Center>
        </>
    )
}
