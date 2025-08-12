import { DAYS_IN_WEEK, WEEKS_IN_YEAR } from "./api/constants";
import { formatYearText } from "./api/utils";
import type {
	SkylineModelComputedParameters,
	SkylineModelInputParameters,
	SkylineModelParameters,
} from "./stores/parameters";
import { SkylineBaseShape } from "./three/types";

export const getDefaultFonts = () => ({
	Inter: "/fonts/facetype/Inter_Regular.json",
	"Inter Bold": "/fonts/facetype/Inter_Bold.json",
	"Press Start": "/fonts/facetype/PressStart2P_Regular.json",
	"Arvo Bold": "/fonts/facetype/Arvo_Bold.json",
	"Bebas Neue": "/fonts/facetype/BebasNeue_Regular.json",
	Quicksilver: "/fonts/facetype/Quicksilver_Regular.json",
});

export const DEFAULT_FONT_SELECTION = "Inter Bold";

export const DEFAULT_FONT = getDefaultFonts()[DEFAULT_FONT_SELECTION];

export const getDefaultParameters = (): SkylineModelParameters => {
	const inputs: SkylineModelInputParameters = {
		name: "battlesquid",
        nameOverride: "",
		startYear: new Date().getFullYear(),
		endYear: new Date().getFullYear(),
		color: "#575757",
		font: DEFAULT_FONT,
        insetText: false,
		insetDepth: 1,
		showContributionColor: false,
		padding: 1.5,
		textDepth: 1.75,
		towerSize: 2.5,
		dampening: 4,
		shape: SkylineBaseShape.Prism,
		filename: "",
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
	const resolvedName = inputs.name;

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
		resolvedName,
	};

	return { inputs, computed };
};
