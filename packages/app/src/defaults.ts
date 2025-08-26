import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "./api/constants";
import { formatYearText } from "./api/utils";
import { LOGOS } from "./logos";
import type {
	SkylineModelComputedParameters,
	SkylineModelInputParameters,
	SkylineModelParameters,
} from "./stores/parameters";
import { ExportFormat } from "./three/export";
import { SkylineBaseShape } from "./three/types";
import { safeString } from "./utils";

export const getDefaultFonts = () => ({
	"Inter Bold": "/fonts/ttf/Inter_Bold.ttf",
	Quicksilver: "/fonts/ttf/Quicksilver_Regular.ttf",
	Inter: "/fonts/ttf/Inter_Regular.ttf",
	"Press Start": "/fonts/ttf/PressStart2P_Regular.ttf",
	"Arvo Bold": "/fonts/ttf/Arvo_Bold.ttf",
	"Space Mono": "/fonts/ttf/SpaceMono-Bold.ttf",
	"Bebas Neue": "/fonts/ttf/BebasNeue_Regular.ttf",
	"Noto Serif": "/fonts/ttf/NotoSerif.ttf",
});

export const DEFAULT_FONT_SELECTION = "Inter Bold";

export const DEFAULT_FONT = getDefaultFonts()[DEFAULT_FONT_SELECTION];

export const getDefaultParameters = (): SkylineModelParameters => {
	const inputs: SkylineModelInputParameters = {
		name: "battlesquid",
		nameOverride: "",
		startYear: new Date().getFullYear(),
		endYear: new Date().getFullYear(),
		color: "#787878",
		font: DEFAULT_FONT,
		insetText: false,
		showContributionColor: false,
		padding: 2,
		textDepth: 1,
		towerSize: 2.5,
		dampening: 4,
		shape: SkylineBaseShape.Prism,
		filename: "",
		scale: 1,
        exportFormat: ExportFormat.ThreeMF,
		logo: LOGOS.Circle,
		logoOffset: 5,
		nameOffset: 10,
		yearOffset: 10,
	};

	const modelLength = WEEKS_IN_YEAR * inputs.towerSize;
	const modelWidth = DAYS_IN_WEEK * inputs.towerSize;
	const platformHeight = inputs.towerSize * 3;
	const halfPlatformHeight = platformHeight / 2;
	const textSize = platformHeight / 2.2;
	const towerSizeOffset = inputs.towerSize / 2;
	const halfModelLength = modelLength / 2;
	const halfModelWidth = modelWidth / 2;
	const paddingWidth = inputs.padding * 2;
	const formattedYear = formatYearText(inputs.startYear, inputs.endYear);
	const resolvedFilename = `${inputs.name}_${formattedYear}_skyline`;
	const resolvedName = safeString(inputs.nameOverride, inputs.name);
	const renderColor = inputs.showContributionColor
		? getDefaultParameters().inputs.color
		: inputs.color;

	const computed: SkylineModelComputedParameters = {
		modelLength,
		modelWidth,
		halfPlatformHeight,
		platformHeight,
		textSize,
		towerSizeOffset,
		halfModelLength,
		halfModelWidth,
		paddingWidth,
		resolvedFilename,
		formattedYear,
		resolvedName,
		renderColor,
	};

	return { inputs, computed };
};
