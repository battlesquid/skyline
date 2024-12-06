import { AppShell, Burger, Button, Divider, Group, LoadingOverlay, NumberInput, Space, Stack, TextInput, Tooltip, useMantineTheme } from "@mantine/core";
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
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [result] = useQuery({
    query: ContributionQuery,
    variables: {
      name,
      start: `${year}-01-01T00:00:00Z`,
      end: `${year}-12-31T00:00:00Z`,
    },
  });

  const usernameRef = useRef<HTMLInputElement>(null!);
  const yearRef = useRef<HTMLInputElement>(null!);

  const theme = useMantineTheme();

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
        <AppShell.Section h="100%">
          <Stack gap={5}>
            <h2>skyline</h2>
            {/* <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" /> */}
            <TextInput ref={usernameRef} label="Github Username" placeholder="Github Username"  />
            <NumberInput ref={yearRef} min={2015} max={new Date().getFullYear()} label="Year" placeholder="Year"  />
            <Button
              fullWidth
              onClick={() => {
                setName(usernameRef.current.value.trim());
                setYear(parseInt(yearRef.current.value));
              }}>
              Generate
            </Button>
          </Stack>
        </AppShell.Section>
        <Divider mb={10} />
        <AppShell.Section>
          <Tooltip label="Work In Progress">
            <Button fullWidth>Export</Button>
          </Tooltip>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main style={{ height: "calc(100vh)", backgroundColor: theme.colors.dark[7] }}>
        <LoadingOverlay visible={result.fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        {!result.fetching && <Skyline weeks={result.data!.user!.contributionsCollection.contributionCalendar.weeks} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}>
          <t.Out />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
