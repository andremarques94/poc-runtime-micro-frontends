import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";

import App from "./App";
import "./remote.css";

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
		const el = document.getElementById("checkout-mfe-root");
		if (!el) {
			throw new Error("Mount point #checkout-mfe-root not found");
		}
		return el;
	},
});

export { bootstrap, mount, unmount };
