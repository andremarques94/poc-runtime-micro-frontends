CREATE TABLE `micro_frontends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`remote_entry_url` text NOT NULL,
	`scope` text NOT NULL,
	`exposed_module` text NOT NULL,
	`route_base_path` text,
	`display_name` text,
	`version` text,
	`enabled` integer DEFAULT true NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `micro_frontends_slug_unique` ON `micro_frontends` (`slug`);