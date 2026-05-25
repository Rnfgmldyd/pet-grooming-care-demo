CREATE TABLE `shops` (
	`id` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` text,
	`description` text,
	`ownerEmail` varchar(320) NOT NULL,
	`plan` enum('free','pro') NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`),
	CONSTRAINT `shops_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `breed` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `age` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `weight` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `groomingRequest` text NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `sensitiveParts` text NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `skinCondition` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `allergy` text NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `notes` text NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `estimatedTime` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `staffNote` text NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `createdAt` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `updatedAt` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `startedAt` bigint;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `completedAt` bigint;--> statement-breakpoint
ALTER TABLE `staff_settings` MODIFY COLUMN `shopId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `shopId` varchar(64) NOT NULL;