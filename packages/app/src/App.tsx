import { AppShell, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import tunnel from "tunnel-rat";
import { isAuthenticated } from "./api/auth";
import "./App.css";
import { Sidebar } from "./components/sidebar/sidebar";
import { Skyline } from "./components/skyline";
import { useExtendedQuery } from "./hooks/useExtendedQuery";
import { useProfile } from "./hooks/useProfile";
import { useParametersStore } from "./stores";

export const t = tunnel();

export default function App() {
  const { parameters } = useParametersStore();
  const authenticated = isAuthenticated();
  const { profile, promise: profilePromise } = useProfile();
  const { years, fetching, ok } = useExtendedQuery({
    name: parameters.name,
    start: parameters.startYear,
    end: parameters.endYear,
    profile: profilePromise
  });

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 0 }}
      padding={"xs"}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      withBorder={false}
    >
      <AppShell.Navbar p="md" pr={0}>
        <Sidebar
          authenticated={authenticated}
          profile={profile}
          ok={ok}
        />
      </AppShell.Navbar>
      <AppShell.Main style={{ height: "calc(100vh)" }}>
        <LoadingOverlay visible={fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        {(authenticated) && (
          <Skyline years={years} />
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}></div>
        <t.Out />
      </AppShell.Main>
    </AppShell >
  );
}
