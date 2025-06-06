import { fixupConfigRules } from "@eslint/compat";
import config from "@skyline/eslint-config";
import reactHooks from "eslint-plugin-react-hooks";
import reactJsx from "eslint-plugin-react/configs/jsx-runtime.js";
import react from "eslint-plugin-react/configs/recommended.js";

export default [
	...config,
	...fixupConfigRules([
		{
			...react,
			settings: {
				react: { version: "detect" },
			},
		},
		reactJsx,
	]),
	{
		plugins: {
			"react-hooks": reactHooks,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react/no-unknown-property": "off",
		},
	},
];
