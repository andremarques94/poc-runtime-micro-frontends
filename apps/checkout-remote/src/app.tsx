export default function App() {
	return (
		<article className="checkout-module">
			<header className="checkout-module__head">
				<span className="checkout-module__badge">MF-01</span>
				<div>
					<p className="checkout-module__label">federated remote</p>
					<h2 className="checkout-module__title">Checkout</h2>
				</div>
			</header>
			<p className="checkout-module__copy">
				Runtime-loaded via Module Federation. Catalog scope{" "}
				<code>checkout</code>, exposed lifecycles mounted in the shell bay.
			</p>
			<div className="checkout-module__footer">
				<span className="checkout-module__signal" aria-hidden="true" />
				<span className="checkout-module__status">module active</span>
			</div>
		</article>
	);
}
