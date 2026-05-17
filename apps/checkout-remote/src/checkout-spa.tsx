import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";

import App from "./app";
import "./remote.css";

const checkoutMountPointId = "checkout-mfe-root";

function getCheckoutMountElement(): HTMLElement {
	const mountElement = document.getElementById(checkoutMountPointId);
	if (!mountElement) {
		throw new Error(`Mount point #${checkoutMountPointId} not found`);
	}
	return mountElement;
}

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
		return getCheckoutMountElement();
	},
});

export { bootstrap, mount, unmount };
