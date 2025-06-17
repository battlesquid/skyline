import {
	ActionIcon,
	Anchor,
	FileButton,
	Group,
	HoverCard,
	Select,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import { IconFolder, IconHelp } from "@tabler/icons-react";
import { useState } from "react";
import { DEFAULT_FONT_SELECTION } from "../defaults";
import { useFontStore, useParametersStore } from "../stores";

export function FontInput() {
	const { parameters, setParameters } = useParametersStore();
	const [fontLoadFailed, setFontLoadFailed] = useState(false);
	const fonts = useFontStore((state) => state.fonts);
	const addFont = useFontStore((state) => state.addFont);

	return (
		<div style={{ display: "flex", columnGap: "0.5rem" }}>
			<Select
				style={{ flex: 1 }}
				label={
					<Group gap={5}>
						Font
						<HoverCard>
							<HoverCard.Target>
								<ThemeIcon size={16} radius={"lg"} variant="light">
									<IconHelp size={16} />
								</ThemeIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown>
								<Text size="sm">
									Must be a valid{" "}
									<Anchor
										href="https://gero3.github.io/facetype.js/"
										target="_blank"
									>
										typeface.js
									</Anchor>{" "}
									font.
								</Text>
							</HoverCard.Dropdown>
						</HoverCard>
					</Group>
				}
				data={Object.keys(fonts)}
				defaultValue={DEFAULT_FONT_SELECTION}
				allowDeselect={false}
				onChange={(value) => {
					if (value === null) {
						return;
					}
					setParameters({ font: fonts[value] });
				}}
				error={fontLoadFailed ? "Unable to load font" : ""}
			/>
			<Stack gap={0}>
				<wbr />
				<FileButton
					onChange={async (file) => {
						setFontLoadFailed(false);
						if (file === null) {
							return;
						}
						const name = file.name.split(".")[0];
						const data = await file.text();
						try {
							setFontLoadFailed(!addFont(name, JSON.parse(data)));
						} catch (e) {
							console.error(e);
						}
					}}
					accept="application/json"
				>
					{(props) => (
						<ActionIcon variant="light" size="input-sm" {...props}>
							<IconFolder />
						</ActionIcon>
					)}
				</FileButton>
			</Stack>
		</div>
	);
}
