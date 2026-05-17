import type { CatalogRemote } from "api/catalog";

import { mountPointId, useCatalog } from "./mf/spa";

const fallbackMountScope = "checkout";

type ShellStatus = {
	className: string;
	label: string;
};

function getShellStatus({
	error,
	isPending,
}: {
	error: Error | null;
	isPending: boolean;
}): ShellStatus {
	if (isPending) {
		return {
			className: "shell-status__pill shell-status__pill--pending",
			label: "linking",
		};
	}

	if (error) {
		return {
			className: "shell-status__pill shell-status__pill--error",
			label: "fault",
		};
	}

	return {
		className: "shell-status__pill shell-status__pill--ok",
		label: "online",
	};
}

function remoteCountLabel(count: number): string {
	return `${count} remote${count === 1 ? "" : "s"}`;
}

function CatalogItem({ remote }: { remote: CatalogRemote }) {
	const statusClassName = remote.enabled
		? "catalog-item__status catalog-item__status--live"
		: "catalog-item__status";

	return (
		<li className="catalog-item">
			<div className="catalog-item__head">
				<span className="catalog-item__slug">{remote.slug}</span>
				<span className={statusClassName}>
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
	);
}

function CatalogPanel({
	error,
	isPending,
	remotes,
}: {
	error: Error | null;
	isPending: boolean;
	remotes: CatalogRemote[];
}) {
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
					<CatalogItem key={remote.slug} remote={remote} />
				))}
			</ul>
			<details className="catalog-raw">
				<summary>Raw payload</summary>
				<pre>{JSON.stringify({ remotes }, null, 2)}</pre>
			</details>
		</>
	);
}

function MountBays({ remotes }: { remotes: CatalogRemote[] }) {
	const uniqueScopes = new Set<string>();
	for (const { scope } of remotes) {
		uniqueScopes.add(scope);
	}
	const mountScopes =
		uniqueScopes.size > 0 ? [...uniqueScopes] : [fallbackMountScope];

	return (
		<>
			<p className="shell-muted mount-bay__hint">
				Remote lifecycles attach below when the catalog resolves.
			</p>
			{mountScopes.map((scope) => (
				<div className="mount-bay" id={mountPointId(scope)} key={scope} />
			))}
		</>
	);
}

export default function App() {
	const { data: remotes = [], error, isPending, isSuccess } = useCatalog();
	const shellStatus = getShellStatus({ error, isPending });

	return (
		<div className="shell">
			<div className="shell-grid" aria-hidden="true" />
			<header className="shell-header">
				<div className="shell-brand">
					<p className="shell-brand__eyebrow">module federation shell</p>
					<h1 className="shell-brand__title">ds-remote</h1>
				</div>
				<div className="shell-status">
					<span className={shellStatus.className}>{shellStatus.label}</span>
					{isSuccess ? (
						<span className="shell-status__meta">
							{remoteCountLabel(remotes.length)}
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
						{remotes.some((r) => r.scope === "registry") ? (
							<p className="shell-muted mount-bay__hint">
								Open the <strong>registry</strong> bay below to register new
								remotes.
							</p>
						) : null}
						<MountBays remotes={remotes} />
					</div>
				</section>
			</div>
		</div>
	);
}
