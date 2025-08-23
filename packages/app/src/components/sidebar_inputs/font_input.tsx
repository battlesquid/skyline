import {
    Group,
    Select
} from "@mantine/core";
import { useState } from "react";
import { DEFAULT_FONT_SELECTION } from "../../defaults";
import { useFontStore } from "../../stores/fonts";
import { useParametersContext } from "../../stores/parameters";

// TODO: re-implement font loading using ttf format

export function FontInput() {
	const setInputs = useParametersContext((state) => state.setInputs);
	const [fontLoadFailed] = useState(false);
	const fonts = useFontStore((state) => state.fonts);

	return (
		<div style={{ display: "flex", columnGap: "0.5rem" }}>
			<Select
				style={{ flex: 1 }}
				label={
					<Group gap={5}>
						Font
						{/* <HoverCard>
							<HoverCard.Target>
								<ThemeIcon size={16} radius={"lg"} variant="light">
									<IconHelp stroke={1} size={16} />
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
						</HoverCard> */}
					</Group>
				}
				data={Object.keys(fonts)}
				defaultValue={DEFAULT_FONT_SELECTION}
				allowDeselect={false}
				onChange={(value) => {
					if (value === null) {
						return;
					}
					setInputs({ font: fonts[value] });
				}}
				error={fontLoadFailed ? "Unable to load font" : ""}
			/>
			{/* <Stack gap={0}>
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
							<IconFolder stroke={1} />
						</ActionIcon>
					)}
				</FileButton>
			</Stack> */}
		</div>
	);
}
