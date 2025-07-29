import { AppShell, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchProfile, isAuthenticated } from "../api/auth";
import { Sidebar } from "../components/sidebar";
import { SkylineControls } from "../components/skyline_controls";
import { useExtendedQuery } from "../hooks/useExtendedQuery";
import { useParametersStore } from "../stores/parameters";
import { Skyline } from "../three/skyline";
import "../styles/editor.css";
import { HoverCard } from '../components/hover_card';
import { useEffect } from "react";

export const Route = createFileRoute('/')({
    component: Editor,
    beforeLoad: ({ location }) => {
        if (!isAuthenticated()) {
            throw redirect({
                to: "/login",
                reloadDocument: true,
                search: {
                    redirect: location.href
                }
            })
        }
    },
    loader: () => fetchProfile()
});

export function Editor() {
    const profile = Route.useLoaderData();
    const setInputs = useParametersStore(state => state.setInputs);
    const name = useParametersStore((state) => state.inputs.name);
    const start = useParametersStore((state) => state.inputs.startYear);
    const end = useParametersStore((state) => state.inputs.endYear);
    const { years, fetching, ok } = useExtendedQuery({
        name,
        start,
        end,
    });

    const [mobileOpened] = useDisclosure();
    const [desktopOpened] = useDisclosure(true);

    useEffect(() => {
        setInputs({ name: profile?.login ?? "" });
    }, []);

    return (
        <AppShell
            header={{ height: 0 }}
            padding={"xs"}
            navbar={{
                width: 320,
                breakpoint: "sm",
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            withBorder={false}
        >
            <AppShell.Navbar p="md" pr={0}>
                <Sidebar profile={profile} ok={ok} />
            </AppShell.Navbar>
            <AppShell.Main style={{ height: "calc(100vh)" }}>
                <LoadingOverlay
                    visible={fetching}
                    zIndex={1000}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />
                <Skyline years={years} />
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        pointerEvents: "none",
                    }}
                >
                    <HoverCard />
                </div>
                <SkylineControls />
            </AppShell.Main>
        </AppShell>
    )
}
