import { AppShell, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import tunnel from "tunnel-rat";
import "./App.css";
import { Sidebar } from "./components/sidebar";
import { Skyline } from "./components/skyline";
import { useExtendedQuery } from "./hooks/useExtendedQuery";
import { useParametersStore } from "./stores";

export const t = tunnel();

export default function App() {
  const { parameters } = useParametersStore();

  const [requestOk, setRequestOk] = useState(true);
  const authenticated = localStorage.getItem("token") !== null;

  const { years, fetching } = useExtendedQuery({
    name: parameters.name,
    start: parameters.startYear,
    end: parameters.endYear
  })

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const theme = useMantineTheme();

  useEffect(() => {
    setRequestOk(true);
  }, [fetching]);

  useEffect(() => {
    if (!fetching && years.length === 0) {
      setRequestOk(false);
    }
  }, [years, fetching]);

  return (
    <AppShell
      header={{ height: 0 }}
      padding={"md"}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Navbar p="md">
        <Sidebar
          authenticated={authenticated}
          ok={requestOk}
        />
      </AppShell.Navbar>
      <AppShell.Main style={{ height: "calc(100vh)", backgroundColor: theme.colors.dark[7] }}>
        <LoadingOverlay visible={fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        {(authenticated && requestOk) && (
          <Skyline years={years} />
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}></div>
        <t.Out />
      </AppShell.Main>
    </AppShell >
  );
}
