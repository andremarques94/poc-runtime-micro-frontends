import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";

import App from "./app";
import "./remote.css";

const CHECKOUT_SHELL_MOUNT_ID = "checkout-mfe-root";

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
		const el = document.getElementById(CHECKOUT_SHELL_MOUNT_ID);
		if (!el) {
			throw new Error(`Mount point #${CHECKOUT_SHELL_MOUNT_ID} not found`);
		}
		return el;
	},
});

export { bootstrap, mount, unmount };
