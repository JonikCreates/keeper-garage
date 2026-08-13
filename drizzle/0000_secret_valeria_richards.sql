CREATE TABLE `known_issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_id` integer NOT NULL,
	`slug` text NOT NULL,
	`issue` text NOT NULL,
	`description` text NOT NULL,
	`symptoms` text NOT NULL,
	`typical_mileage` text,
	`severity` text NOT NULL,
	`preventative_action` text NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `vehicle_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_known_issues_platform_slug` ON `known_issues` (`platform_id`,`slug`);--> statement-breakpoint
CREATE TABLE `maintenance_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_id` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`oem_mileage_interval` integer,
	`oem_time_months` integer,
	`community_mileage_interval` integer,
	`community_time_months` integer,
	`oem_summary` text NOT NULL,
	`community_summary` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `vehicle_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_maintenance_items_platform_slug` ON `maintenance_items` (`platform_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_maintenance_items_platform_category` ON `maintenance_items` (`platform_id`,`category`);--> statement-breakpoint
CREATE TABLE `maintenance_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`maintenance_item_id` integer NOT NULL,
	`service_date` text NOT NULL,
	`mileage` integer NOT NULL,
	`cost` real,
	`shop` text,
	`notes` text,
	`fluid` text,
	`fluid_quantity` text,
	`parts_used` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maintenance_item_id`) REFERENCES `maintenance_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_records_vehicle_date` ON `maintenance_records` (`vehicle_id`,`service_date`);--> statement-breakpoint
CREATE INDEX `idx_records_vehicle_item` ON `maintenance_records` (`vehicle_id`,`maintenance_item_id`);--> statement-breakpoint
CREATE TABLE `parts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`maintenance_item_id` integer NOT NULL,
	`part_name` text NOT NULL,
	`oem_part_number` text,
	`notes` text,
	`purchase_url` text,
	FOREIGN KEY (`maintenance_item_id`) REFERENCES `maintenance_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_parts_item_name` ON `parts` (`maintenance_item_id`,`part_name`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`maintenance_item_id` integer,
	`known_issue_id` integer,
	`source_type` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`publisher` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`maintenance_item_id`) REFERENCES `maintenance_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`known_issue_id`) REFERENCES `known_issues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sources_item_url` ON `sources` (`maintenance_item_id`,`url`);--> statement-breakpoint
CREATE INDEX `idx_sources_known_issue` ON `sources` (`known_issue_id`);--> statement-breakpoint
CREATE TABLE `vehicle_platforms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`year_start` integer NOT NULL,
	`year_end` integer NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`trim` text NOT NULL,
	`engine` text NOT NULL,
	`transmission` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vehicle_platforms_slug` ON `vehicle_platforms` (`slug`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`platform_id` integer NOT NULL,
	`year` integer NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`trim` text NOT NULL,
	`engine` text NOT NULL,
	`transmission` text NOT NULL,
	`nickname` text,
	`current_mileage` integer NOT NULL,
	`purchase_mileage` integer,
	`purchase_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `vehicle_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_vehicles_user_id` ON `vehicles` (`user_id`);