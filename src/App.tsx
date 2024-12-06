import { AppShell, Burger, Button, Group, LoadingOverlay, TextInput, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRef, useState } from "react";
import { useQuery } from "urql";
import { ContributionQuery } from "./api/query";
import "./App.css";
import { Skyline } from "./components/skyline";

import tunnel from "tunnel-rat";
export const t = tunnel();

export default function App() {
  const [name, setName] = useState("Battlesquid");
  const [year, setYear] = useState(new Date().getFullYear());

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();

  const [result] = useQuery({
    query: ContributionQuery,
    variables: {
      name,
      start: `${year}-01-01T00:00:00Z`,
      end: `${year}-12-31T00:00:00Z`,
    },
  });

  const input = useRef<HTMLInputElement>(null!);

  const theme = useMantineTheme();

  return (
    <AppShell
      header={{ height: 60 }}
      padding={"md"}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          skyline
          <TextInput ref={input} placeholder="Github Username" />
          <Button onClick={() => setName(input.current.value.trim())}>Search</Button>
        </Group>
      </AppShell.Header>
      <AppShell.Main style={{ height: "calc(100vh - 96px)", backgroundColor: theme.colors.dark[7] }}>
        <LoadingOverlay visible={result.fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        {!result.fetching && <Skyline weeks={result.data!.user!.contributionsCollection.contributionCalendar.weeks} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}>
          <t.Out />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
