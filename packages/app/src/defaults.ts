import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "./api/constants";
import { formatYearText } from "./api/utils";
import type {
	SkylineModelComputedParameters,
	SkylineModelInputParameters,
	SkylineModelParameters,
} from "./stores/parameters";
import { SkylineBaseShape } from "./three/types";

export const getDefaultFonts = () => ({
	Inter: "/Inter_Regular.json",
	"Inter Bold": "/Inter_Bold.json",
	"Press Start": "/Press Start 2P_Regular.json",
	"Arvo Bold": "/Arvo_Bold.json",
	"Bebas Neue": "/Bebas Neue_Regular.json",
	Quicksilver: "/Quicksilver_Regular.json",
});

export const DEFAULT_FONT_SELECTION = "Inter Bold";

export const DEFAULT_FONT = getDefaultFonts()[DEFAULT_FONT_SELECTION];

export const getDefaultParameters = (): SkylineModelParameters => {
	const inputs: SkylineModelInputParameters = {
		name: "battlesquid",
		startYear: new Date().getFullYear(),
		endYear: new Date().getFullYear(),
		color: "#575757",
		font: DEFAULT_FONT,
		showContributionColor: false,
		padding: 1.5,
		textDepth: 1.75,
		towerSize: 2.5,
		dampening: 4,
		shape: SkylineBaseShape.Prism,
		filename: `battlesquid_${new Date().getFullYear()}_skyline`,
		scale: 1,
	};

	const modelLength = WEEKS_IN_YEAR * inputs.towerSize;
	const modelWidth = DAYS_IN_WEEK * inputs.towerSize;
	const platformHeight = inputs.towerSize * 3;
	const platformMidpoint = platformHeight / 2;
	const textSize = platformHeight / 2.2;
	const towerSizeOffset = inputs.towerSize / 2;
	const xMidpointOffset = modelLength / 2;
	const yMidpointOffset = modelWidth / 2;
	const paddingWidth = inputs.padding * 2;
	const defaultFilename = `${inputs.name}_${formatYearText(inputs.startYear, inputs.endYear)}_skyline`;

	const computed: SkylineModelComputedParameters = {
		modelLength,
		modelWidth,
		platformMidpoint,
		platformHeight,
		textSize,
		towerSizeOffset,
		xMidpointOffset,
		yMidpointOffset,
		paddingWidth,
		defaultFilename,
	};

	return { inputs, computed };
};
