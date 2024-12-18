import { AppShell, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import tunnel from "tunnel-rat";
import { useQuery } from "urql";
import { ContributionQuery } from "./api/query";
import "./App.css";
import { Skyline } from "./components/skyline";
import { Sidebar } from "./components/sidebar";

export const t = tunnel();

export interface SkylineModelParameters {
  name: string;
  year: number;
  towerSize: number;
  towerDampening: number;
  font: string;
  padding: number;
  textDepth: number;
  color: string;
  showContributionColor: boolean;
}

export default function App() {
  const [parameters, setParameters] = useState<SkylineModelParameters>({
    name: "Battlesquid",
    year: new Date().getFullYear(),
    color: "#575757",
    font: "/Inter_Bold.json",
    showContributionColor: false,
    padding: 0.5,
    textDepth: 0.25,
    towerSize: 0.6,
    towerDampening: 4
  });

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [result] = useQuery({
    query: ContributionQuery,
    variables: {
      name: parameters.name,
      start: `${parameters.year}-01-01T00:00:00Z`,
      end: `${parameters.year}-12-31T00:00:00Z`,
    },
  });

  const theme = useMantineTheme();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(
      localStorage.getItem("token") !== null
      && !result.fetching
    )
  }, [result.fetching]);

  const appContent = ready
    ? (
      <>
        <Skyline
          parameters={parameters}
          weeks={result.data!.user!.contributionsCollection.contributionCalendar.weeks}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}></div>
      </>
    )
    : (
      <></>
    )

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
          ready={ready}
          parameters={parameters}
          setParameters={setParameters}
          onExport={() => {

          }}
        />
      </AppShell.Navbar>
      <AppShell.Main style={{ height: "calc(100vh)", backgroundColor: theme.colors.dark[7] }}>
        <LoadingOverlay visible={result.fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        {appContent}
        <t.Out />
      </AppShell.Main>
    </AppShell >
  );
}
