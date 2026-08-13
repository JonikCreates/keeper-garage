CREATE TABLE `issue_library` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_id` integer NOT NULL,
	`slug` text NOT NULL,
	`system` text NOT NULL,
	`issue` text NOT NULL,
	`description` text NOT NULL,
	`symptoms` text NOT NULL,
	`typical_mileage` text NOT NULL,
	`severity` text NOT NULL,
	`urgency` text NOT NULL,
	`evidence` text NOT NULL,
	`preventative_action` text NOT NULL,
	`trims` text,
	`engines` text,
	`drivetrains` text,
	`transmissions` text,
	FOREIGN KEY (`platform_id`) REFERENCES `vehicle_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_issue_library_platform_slug` ON `issue_library` (`platform_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_issue_library_engine` ON `issue_library` (`engines`);--> statement-breakpoint
CREATE INDEX `idx_issue_library_urgency` ON `issue_library` (`urgency`);--> statement-breakpoint
CREATE TABLE `issue_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`source_type` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`publisher` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`issue_id`) REFERENCES `issue_library`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_issue_sources_issue_url` ON `issue_sources` (`issue_id`,`url`);--> statement-breakpoint
CREATE INDEX `idx_issue_sources_issue` ON `issue_sources` (`issue_id`);--> statement-breakpoint
CREATE TABLE `maintenance_rules` (
	`maintenance_item_id` integer PRIMARY KEY NOT NULL,
	`trims` text,
	`engines` text,
	`drivetrains` text,
	`transmissions` text,
	FOREIGN KEY (`maintenance_item_id`) REFERENCES `maintenance_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicle_profiles` (
	`vehicle_id` integer PRIMARY KEY NOT NULL,
	`body_code` text NOT NULL,
	`engine_code` text NOT NULL,
	`drivetrain` text NOT NULL,
	`transmission` text NOT NULL,
	`market` text NOT NULL,
	`emissions` text NOT NULL,
	`production_date` text,
	`vin_last7` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_profiles_engine` ON `vehicle_profiles` (`engine_code`);