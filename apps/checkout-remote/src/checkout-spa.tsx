import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";

import App from "./app";
import "./remote.css";

const shellMountPointId = "checkout-mfe-root";

const { bootstrap, mount, unmount } = singleSpaReact({
	React,
	ReactDOMClient,
	rootComponent: App,
	errorBoundary() {
		return (
			<div className="remote-error">
				<p className="remote-error-title">Checkout failed</p>
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
