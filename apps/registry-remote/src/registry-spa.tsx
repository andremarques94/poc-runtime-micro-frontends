import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";

import App from "./app";
import "./remote.css";

const shellMountPointId = "registry-mfe-root";
const queryClient = new QueryClient();

function RegistryRoot() {
	return (
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	);
}

const { bootstrap, mount, unmount } = singleSpaReact({
	React,
	ReactDOMClient,
	rootComponent: RegistryRoot,
	errorBoundary() {
		return (
			<div className="remote-error">
				<p className="remote-error-title">Registry failed</p>
			</div>
		);
	},
	domElementGetter() {
		const el = document.getElementById(shellMountPointId);
		if (!el) {
			throw new Error(`Mount point #${shellMountPointId} not found`);
		}
		return el;
	},
});

export { bootstrap, mount, unmount };
