import type { CatalogRemote } from "api/catalog";

import { mountPointId, useCatalog } from "./mf/spa";

const checkoutMountId = mountPointId("checkout");
type ShellStatus = "linking" | "fault" | "online";

type CatalogPanelProps = {
	error: Error | null;
	isPending: boolean;
	remotes: CatalogRemote[];
};

function CatalogPanel({ error, isPending, remotes }: CatalogPanelProps) {
	if (error) {
		return <p className="shell-alert shell-alert--error">{error.message}</p>;
	}

	if (isPending) {
		return (
			<div className="catalog-loading" aria-busy="true">
				<span className="catalog-loading__pulse" />
				<span>Syncing catalog from /api/mf/remotes</span>
			</div>
		);
	}

	if (remotes.length === 0) {
		return <p className="shell-muted">No remotes registered.</p>;
	}

	return (
		<>
			<ul className="catalog-list">
				{remotes.map((remote) => (
					<li className="catalog-item" key={remote.slug}>
						<div className="catalog-item__head">
							<span className="catalog-item__slug">{remote.slug}</span>
							<span
								className={
									remote.enabled
										? "catalog-item__status catalog-item__status--live"
										: "catalog-item__status"
								}
							>
								{remote.enabled ? "live" : "off"}
							</span>
						</div>
						<dl className="catalog-item__meta">
							<div>
								<dt>scope</dt>
								<dd>{remote.scope}</dd>
							</div>
							<div>
								<dt>entry</dt>
								<dd>{remote.remoteEntryUrl}</dd>
							</div>
						</dl>
					</li>
				))}
			</ul>
			<details className="catalog-raw">
				<summary>Raw payload</summary>
				<pre>{JSON.stringify({ remotes }, null, 2)}</pre>
			</details>
		</>
	);
}

function getShellStatus(error: Error | null, isPending: boolean): ShellStatus {
	if (isPending) {
		return "linking";
	}

	if (error) {
		return "fault";
	}

	return "online";
}

function assertNever(value: never): never {
	throw new Error(`Unhandled status: ${value}`);
}

function getShellStatusClassName(status: ShellStatus): string {
	switch (status) {
		case "linking":
			return "shell-status__pill shell-status__pill--pending";
		case "fault":
			return "shell-status__pill shell-status__pill--error";
		case "online":
			return "shell-status__pill shell-status__pill--ok";
		default:
			return assertNever(status);
	}
}

function getRemoteCountLabel(remoteCount: number): string {
	const suffix = remoteCount === 1 ? "" : "s";
	return `${remoteCount} remote${suffix}`;
}

export default function App() {
	const { data: remotes = [], error, isPending, isSuccess } = useCatalog();
	const shellStatus = getShellStatus(error, isPending);
	const shellStatusClassName = getShellStatusClassName(shellStatus);

	return (
		<div className="shell">
			<div className="shell-grid" aria-hidden="true" />
			<header className="shell-header">
				<div className="shell-brand">
					<p className="shell-brand__eyebrow">module federation shell</p>
					<h1 className="shell-brand__title">ds-remote</h1>
				</div>
				<div className="shell-status">
					<span className={shellStatusClassName}>{shellStatus}</span>
					{isSuccess ? (
						<span className="shell-status__meta">
							{getRemoteCountLabel(remotes.length)}
						</span>
					) : null}
				</div>
			</header>

			<div className="shell-panels">
				<section className="panel panel--catalog">
					<header className="panel__head">
						<span className="panel__index">01</span>
						<h2 className="panel__title">Catalog</h2>
					</header>
					<div className="panel__body">
						<CatalogPanel
							error={error}
							isPending={isPending}
							remotes={remotes}
						/>
					</div>
				</section>

				<section className="panel panel--mount">
					<header className="panel__head">
						<span className="panel__index">02</span>
						<h2 className="panel__title">Mount bay</h2>
					</header>
					<div className="panel__body panel__body--mount">
						<p className="shell-muted mount-bay__hint">
							Remote lifecycles attach below when the catalog resolves.
						</p>
						<div className="mount-bay" id={checkoutMountId} />
					</div>
				</section>
			</div>
		</div>
	);
}
