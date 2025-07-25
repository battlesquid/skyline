import { AppShell, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { isAuthenticated } from "../api/auth";
import "../styles/app.css";
import { HoverCard } from "../components/hover_card";
import { Sidebar } from "../components/sidebar";
import { SkylineControls } from "../components/skyline_controls";
import { useExtendedQuery } from "../hooks/useExtendedQuery";
import { useProfile } from "../hooks/useProfile";
import { useParametersStore } from "../stores/parameters";
import { Skyline } from "../three/skyline";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor")({
  component: Editor,
})

function Editor() {
	const name = useParametersStore((state) => state.inputs.name);
	const start = useParametersStore((state) => state.inputs.startYear);
	const end = useParametersStore((state) => state.inputs.endYear);
	const authenticated = isAuthenticated();
	const {
		profile,
		promise: profilePromise,
		loading: profileLoading,
	} = useProfile();
	const { years, fetching, ok } = useExtendedQuery({
		name,
		start,
		end,
		profile: profilePromise,
	});

	const [mobileOpened] = useDisclosure();
	const [desktopOpened] = useDisclosure(true);
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
				{!profileLoading && (
					<Sidebar authenticated={authenticated} profile={profile} ok={ok} />
				)}
			</AppShell.Navbar>
			<AppShell.Main style={{ height: "calc(100vh)" }}>
				<LoadingOverlay
					visible={fetching}
					zIndex={1000}
					overlayProps={{ radius: "sm", blur: 2 }}
				/>
				{authenticated && <Skyline years={years} />}
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
