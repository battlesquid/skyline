import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "urql";
import { client } from "./api/client";
import App from "./app";
import { preloadDefaultFonts } from "./stores/fonts";
import { shadcnCssVariableResolver } from "./theme/css_variable_resolver";
import { shadcnTheme } from "./theme/theme";
import "./theme/style.css";

preloadDefaultFonts();

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<React.StrictMode>
			<MantineProvider
				theme={shadcnTheme}
				cssVariablesResolver={shadcnCssVariableResolver}
				forceColorScheme="dark"
			>
				<Provider value={client}>
					<App />
				</Provider>
			</MantineProvider>
		</React.StrictMode>,
	);
}
