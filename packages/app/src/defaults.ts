import { getUsername } from "./api/auth";

export const getDefaultFonts = () => ({
    "Inter": "/Inter_Regular.json",
    "Inter Bold": "/Inter_Bold.json",
    "Press Start": "/Press Start 2P_Regular.json",
    "Arvo Bold": "/Arvo_Bold.json",
    "Bebas Neue": "/Bebas Neue_Regular.json",
    "Quicksilver": "/Quicksilver_Regular.json"
})

export const DEFAULT_FONT_SELECTION = "Inter Bold";

export const DEFAULT_FONT = getDefaultFonts()[DEFAULT_FONT_SELECTION];

export const getDefaultParameters = () => ({
    name: getUsername() ?? "Battlesquid",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    color: "#575757",
    font: DEFAULT_FONT,
    showContributionColor: false,
    padding: 1.5,
    textDepth: 1.75,
    towerSize: 2.5,
    dampening: 4
});
