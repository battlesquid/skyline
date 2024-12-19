import { AppShell, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import tunnel from "tunnel-rat";
import { useQuery } from "urql";
import { ContributionQuery } from "./api/query";
import "./App.css";
import { Skyline } from "./components/skyline";
import { Sidebar } from "./components/sidebar";
import { defaults, SkylineModelParameters } from "./parameters";
import { ContributionWeeks } from "./api/types";

export const t = tunnel();

export default function App() {
  const [parameters, setParameters] = useState<SkylineModelParameters>(defaults);
  const [weeks, setWeeks] = useState<ContributionWeeks>([]);
  const [requestOk, setRequestOk] = useState(true);
  const [result] = useQuery({
    query: ContributionQuery,
    variables: {
      name: parameters.name,
      start: `${parameters.year}-01-01T00:00:00Z`,
      end: `${parameters.year}-12-31T00:00:00Z`,
    },
  });
  
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const theme = useMantineTheme();

  useEffect(() => {
    setRequestOk(true);
  }, [result.fetching]);

  useEffect(() => {
    if (result.data?.user) {
      setWeeks(result.data.user.contributionsCollection.contributionCalendar.weeks);
    } else {
      setRequestOk(false);
    }
  }, [result.data]);

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
          authenticated={localStorage.getItem("token") !== null}
          ok={requestOk}
          parameters={parameters}
          setParameters={setParameters}
        />
      </AppShell.Navbar>
      <AppShell.Main style={{ height: "calc(100vh)", backgroundColor: theme.colors.dark[7] }}>
        <LoadingOverlay visible={result.fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Skyline
          parameters={parameters}
          weeks={weeks}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}></div>
        <t.Out />
      </AppShell.Main>
    </AppShell >
  );
}
