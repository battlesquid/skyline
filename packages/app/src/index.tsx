import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "urql";
import App from "./App";
import { client } from "./api/client";
import { preloadDefaultFonts } from "./stores";

preloadDefaultFonts();

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<React.StrictMode>
			<MantineProvider forceColorScheme="dark">
				<Provider value={client}>
					<App />
				</Provider>
			</MantineProvider>
		</React.StrictMode>
	);
}
