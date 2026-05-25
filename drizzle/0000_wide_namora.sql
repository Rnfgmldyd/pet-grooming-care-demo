CREATE TABLE `appointments` (
	`id` varchar(64) NOT NULL,
	`ownerName` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`dogName` varchar(100) NOT NULL,
	`breed` varchar(100) NOT NULL DEFAULT '',
	`age` varchar(20) NOT NULL DEFAULT '',
	`weight` varchar(20) NOT NULL DEFAULT '',
	`groomingRequest` text NOT NULL DEFAULT (''),
	`sensitiveParts` text NOT NULL DEFAULT ('[]'),
	`skinCondition` varchar(50) NOT NULL DEFAULT '정상',
	`biteRisk` boolean NOT NULL DEFAULT false,
	`allergy` text NOT NULL DEFAULT ('없음'),
	`notes` text NOT NULL DEFAULT (''),
	`status` enum('접수완료','미용준비중','목욕중','드라이중','커트중','마무리중','완료','특이사항있음') NOT NULL DEFAULT '접수완료',
	`estimatedTime` varchar(50) NOT NULL DEFAULT '',
	`staffNote` text NOT NULL DEFAULT (''),
	`completedPhoto` text,
	`pickupEta` varchar(50),
	`source` enum('staff','owner') NOT NULL DEFAULT 'staff',
	`createdAt` int NOT NULL,
	`updatedAt` int NOT NULL,
	`startedAt` int,
	`completedAt` int,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` varchar(64) NOT NULL DEFAULT 'default',
	`pinHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_settings_shopId_unique` UNIQUE(`shopId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
