import { WEEKS_IN_YEAR, DAYS_IN_WEEK } from "./api/constants";
import type { SkylineModelParameters } from "./stores";
import { SkylineBaseShape } from "./three/skyline_base";

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
    const inputs = {
        name: "Battlesquid",
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear(),
        color: "#575757",
        font: DEFAULT_FONT,
        showContributionColor: false,
        padding: 1.5,
        textDepth: 1.75,
        towerSize: 2.5,
        dampening: 4,
        shape: SkylineBaseShape.Prism
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

    const computed = {
        modelLength,
        modelWidth,
        platformMidpoint,
        platformHeight,
        textSize,
        towerSizeOffset,
        xMidpointOffset,
        yMidpointOffset,
        paddingWidth
    }
    return { inputs, computed };
};
