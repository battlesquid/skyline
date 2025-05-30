import { AppShell, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import tunnel from "tunnel-rat";
import "./App.css";
import { Sidebar } from "./components/sidebar";
import { Skyline } from "./components/skyline";
import { useExtendedQuery } from "./hooks/useExtendedQuery";
import { useParametersStore } from "./stores";
import { fetchProfile, isAuthenticated } from "./api/auth";
import { useMemo } from "react";

export const t = tunnel();

export default function App() {
    const { parameters } = useParametersStore();
    const authenticated = isAuthenticated();
    const profile = useMemo(() => fetchProfile(), []);
    const { years, fetching, ok } = useExtendedQuery({
        name:  parameters.name,
        start: parameters.startYear,
        end: parameters.endYear,
        profile
    });

    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const theme = useMantineTheme();

    return (
        <AppShell
            header={{ height: 0 }}
            padding={"sm"}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
        >
            <AppShell.Navbar p="md">
                <Sidebar
                    authenticated={authenticated}
                    profile={null}
                    ok={ok}
                />
            </AppShell.Navbar>
            <AppShell.Main style={{ height: "calc(100vh)", backgroundColor: theme.colors.dark[7] }}>
                <LoadingOverlay visible={fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                {(authenticated && ok && years.length) && (
                    <Skyline years={years} />
                )}
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}></div>
                <t.Out />
            </AppShell.Main>
        </AppShell >
    );
}
