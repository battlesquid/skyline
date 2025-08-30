import {
	Affix,
	Box,
	Button,
	Center,
	Flex,
	LoadingOverlay,
	Stack
} from "@mantine/core";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { animate, createScope, createTimeline, Scope, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { isAuthenticated, resolveToken } from "../api/auth";
import ContributionBackground from "../components/contribution_background";
import "../styles/login.css";
import "../styles/page.css";


type LoginSearchParams = {
	code?: string;
	redirect?: string;
};

export const Route = createFileRoute("/login")({
	component: Login,
	beforeLoad: ({ search }) => {
		if (isAuthenticated()) {
			throw redirect({
				to: search.redirect ?? "/",
				reloadDocument: true,
				replace: true,
			});
		}
	},
	validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
		return {
			code: (search.code as string) ?? undefined,
			redirect: (search.redirect as string) ?? undefined,
		};
	},
});

function Login() {
	const router = useRouter();
	const { code } = Route.useSearch();
	const loading = useRef<boolean | null>(null);

	const root = useRef(null);
	const scope = useRef<Scope | null>(null);

	useEffect(() => {
		const handleRedirect = async (code: string) => {
			await resolveToken(code);
			await router.invalidate();
		};
		if (code !== undefined && !loading.current) {
			loading.current = true;
			handleRedirect(code);
		}
	}, []);

	useEffect(() => {
		if (loading.current) {
			return;
		}
		scope.current = createScope({ root }).add(() => {
			const slideinfade = animate(".logo", {
				ease: "outExpo",
				opacity: 1,
				gap: "1rem",
                duration: 500
			});

			createTimeline()
				.sync(slideinfade)
				.add(".slide-up", {
					ease: "cubicBezier(.28,1,0,1)",
					y: stagger("-1.5rem"),
					delay: stagger(10),
					marginTop: "4.5rem"
				})

			createTimeline()
				.sync(slideinfade)
				.add(".slide-down", {
					ease: "cubicBezier(.28,1,0,1)",
					y: stagger("1.5rem",),
					delay: stagger(10, {
						reversed: true
					}),
					marginBottom: "4.5rem"
				})
				.add(".caption-item", {
					opacity: 1,
					delay: stagger(100)
				})
		});
		return () => scope.current?.revert();
	}, [])

	const _3D = (
		<span
			style={{
				color: "var(--mantine-color-pink-5)",
			}}
		>
			3D
		</span>
	);

	return (
		<Box ref={root} h="100%">
			<ContributionBackground />
			<LoadingOverlay
				visible={loading.current ?? false}
				zIndex={1000}
				overlayProps={{ radius: "sm" }}
				loaderProps={{ type: "bars" }}
			/>
			<Center h="100%">
				<Flex gap={20}>
					<Center>
						<Stack gap={30}>
							<div className="logo">
								<div className="stack mona-sans-wide title github-text">
									<span className="slide-up neon-blue">GITHUB</span>
									<span className="slide-up neon-blue">GITHUB</span>
									<span className="slide-up neon-blue">GITHUB</span>
									<span className="slide-up pink-text">GITHUB</span>
								</div>
								<div className="stack mona-sans-wide title skyline-text">
									<span className="slide-down neon-pink">SKYLINE</span>
									<span className="slide-down neon-pink">SKYLINE</span>
									<span className="slide-down neon-pink">SKYLINE</span>
									<span className="slide-down pink-text">SKYLINE</span>
								</div>
							</div>
							<Stack className="caption">
								<div className="caption-item mona-sans-wide">YOUR CONTRIBUTION STORY IN 3D</div>
								<Button
									className="caption-item"
									component="a"
									href={import.meta.env.PUBLIC_WORKER_URL}
									fullWidth={true}
								>
									Login to Github
								</Button>
								<Button
									className="caption-item"
									component="a"
									href={import.meta.env.PUBLIC_WORKER_ENTERPRISE_URL}
									fullWidth={true}
								>
									Login to Cloud Enterprise
								</Button>
							</Stack>
						</Stack>
					</Center>
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
		</Box>
	);
}
