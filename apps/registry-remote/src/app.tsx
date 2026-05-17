import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CatalogRemote,
	catalogRemotesResponseSchema,
	catalogRemoteResponseSchema,
	createCatalogRemoteSchema,
} from "api/catalog";
import { type FormEvent, useId, useState } from "react";
import { z } from "zod";

const MF_CATALOG_CHANGED = "mf-catalog-changed";

const remotesQueryKey = ["mf", "remotes"] as const;

const emptyForm = {
	slug: "",
	scope: "",
	displayName: "",
	version: "1.0.0",
	remoteEntryUrl: "",
	exposedModule: "./lifecycles",
	routeBasePath: "",
	metadataJson: "{}",
};

async function fetchRemotes(): Promise<CatalogRemote[]> {
	const response = await fetch("/api/mf/remotes");
	if (!response.ok) {
		throw new Error(`catalog HTTP ${response.status}`);
	}
	const { remotes } = catalogRemotesResponseSchema.parse(await response.json());
	return remotes;
}

function parseMetadata(raw: string): Record<string, unknown> {
	const trimmed = raw.trim();
	if (!trimmed) {
		return {};
	}
	return z.record(z.unknown()).parse(JSON.parse(trimmed));
}

function RemoteRow({ remote }: { remote: CatalogRemote }) {
	return (
		<li className="registry-catalog__item">
			<div className="registry-catalog__head">
				<span className="registry-catalog__slug">{remote.slug}</span>
				<span className="registry-catalog__scope">{remote.scope}</span>
			</div>
			<p className="registry-catalog__entry">{remote.remoteEntryUrl}</p>
		</li>
	);
}

export default function App() {
	const formId = useId();
	const queryClient = useQueryClient();
	const [form, setForm] = useState(emptyForm);
	const [formError, setFormError] = useState<string | null>(null);
	const [successSlug, setSuccessSlug] = useState<string | null>(null);

	const remotesQuery = useQuery({
		queryKey: remotesQueryKey,
		queryFn: fetchRemotes,
	});

	const registerMutation = useMutation({
		mutationFn: async (payload: z.infer<typeof createCatalogRemoteSchema>) => {
			const response = await fetch("/api/mf/remotes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (response.status === 409) {
				throw new Error("Slug or scope already exists in the catalog.");
			}
			if (!response.ok) {
				throw new Error(`register HTTP ${response.status}`);
			}
			return catalogRemoteResponseSchema.parse(await response.json());
		},
		onSuccess: ({ remote }) => {
			setSuccessSlug(remote.slug);
			setForm(emptyForm);
			setFormError(null);
			void queryClient.invalidateQueries({ queryKey: remotesQueryKey });
			window.dispatchEvent(new CustomEvent(MF_CATALOG_CHANGED));
		},
		onError: (error: Error) => {
			setSuccessSlug(null);
			setFormError(error.message);
		},
	});

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError(null);
		setSuccessSlug(null);

		let metadata: Record<string, unknown>;
		try {
			metadata = parseMetadata(form.metadataJson);
		} catch {
			setFormError("Metadata must be valid JSON object.");
			return;
		}

		const payload = createCatalogRemoteSchema.safeParse({
			slug: form.slug.trim(),
			scope: form.scope.trim(),
			displayName: form.displayName.trim() || null,
			version: form.version.trim() || null,
			remoteEntryUrl: form.remoteEntryUrl.trim(),
			exposedModule: form.exposedModule.trim() || "./lifecycles",
			routeBasePath: form.routeBasePath.trim() || null,
			metadata,
		});

		if (!payload.success) {
			setFormError(payload.error.issues[0]?.message ?? "Invalid form data.");
			return;
		}

		registerMutation.mutate(payload.data);
	};

	const remotes = remotesQuery.data ?? [];

	return (
		<article className="registry-studio">
			<header className="registry-studio__masthead">
				<p className="registry-studio__kicker">control room</p>
				<h2 className="registry-studio__title">MFE Registry</h2>
				<p className="registry-studio__lede">
					Register federated remotes for the shell catalog. Scope must match your
					webpack <code>name</code>; same-origin entries use{" "}
					<code>/mf-&lt;slug&gt;/remoteEntry.js</code>.
				</p>
			</header>

			<div className="registry-studio__grid">
				<section className="registry-panel">
					<h3 className="registry-panel__title">Register remote</h3>
					<form className="registry-form" id={formId} onSubmit={onSubmit}>
						<label className="registry-field">
							<span>Slug</span>
							<input
								name="slug"
								onChange={(e) =>
									setForm((prev) => ({ ...prev, slug: e.target.value }))
								}
								placeholder="payments"
								required
								value={form.slug}
							/>
							<small>URL segment and catalog key (lowercase, hyphens).</small>
						</label>

						<label className="registry-field">
							<span>Scope</span>
							<input
								name="scope"
								onChange={(e) =>
									setForm((prev) => ({ ...prev, scope: e.target.value }))
								}
								placeholder="payments"
								required
								value={form.scope}
							/>
							<small>Module Federation name in remote webpack config.</small>
						</label>

						<label className="registry-field">
							<span>Display name</span>
							<input
								name="displayName"
								onChange={(e) =>
									setForm((prev) => ({ ...prev, displayName: e.target.value }))
								}
								placeholder="Payments"
								value={form.displayName}
							/>
						</label>

						<label className="registry-field">
							<span>Version</span>
							<input
								name="version"
								onChange={(e) =>
									setForm((prev) => ({ ...prev, version: e.target.value }))
								}
								value={form.version}
							/>
						</label>

						<label className="registry-field registry-field--wide">
							<span>Remote entry URL</span>
							<input
								name="remoteEntryUrl"
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										remoteEntryUrl: e.target.value,
									}))
								}
								placeholder="/mf-payments/remoteEntry.js"
								required
								value={form.remoteEntryUrl}
							/>
						</label>

						<label className="registry-field">
							<span>Exposed module</span>
							<input
								name="exposedModule"
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										exposedModule: e.target.value,
									}))
								}
								value={form.exposedModule}
							/>
						</label>

						<label className="registry-field">
							<span>Route base (optional)</span>
							<input
								name="routeBasePath"
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										routeBasePath: e.target.value,
									}))
								}
								placeholder="/payments"
								value={form.routeBasePath}
							/>
						</label>

						<label className="registry-field registry-field--wide">
							<span>Metadata JSON</span>
							<textarea
								name="metadataJson"
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										metadataJson: e.target.value,
									}))
								}
								rows={3}
								value={form.metadataJson}
							/>
						</label>

						{formError ? (
							<p className="registry-form__error" role="alert">
								{formError}
							</p>
						) : null}

						{successSlug ? (
							<p className="registry-form__success" role="status">
								Registered <strong>{successSlug}</strong> — shell catalog
								refreshed.
							</p>
						) : null}

						<button
							className="registry-form__submit"
							disabled={registerMutation.isPending}
							type="submit"
						>
							{registerMutation.isPending ? "Registering…" : "Add to catalog"}
						</button>
					</form>
				</section>

				<section className="registry-panel">
					<h3 className="registry-panel__title">Enabled remotes</h3>
					{remotesQuery.isPending ? (
						<p className="registry-catalog__status">Loading catalog…</p>
					) : null}
					{remotesQuery.error ? (
						<p className="registry-form__error" role="alert">
							{remotesQuery.error.message}
						</p>
					) : null}
					{remotesQuery.isSuccess && remotes.length === 0 ? (
						<p className="registry-catalog__status">No remotes yet.</p>
					) : null}
					{remotes.length > 0 ? (
						<ul className="registry-catalog">
							{remotes.map((remote) => (
								<RemoteRow key={remote.slug} remote={remote} />
							))}
						</ul>
					) : null}
				</section>
			</div>
		</article>
	);
}
