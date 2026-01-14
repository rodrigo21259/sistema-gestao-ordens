CREATE TABLE `customFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('TEXT','NUMBER','BOOLEAN','DROPDOWN') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`options` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderCustomValues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`fieldId` int NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderCustomValues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientCode` varchar(255) NOT NULL,
	`product` varchar(255) NOT NULL,
	`volume` decimal(18,4) NOT NULL,
	`revenue` decimal(18,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rankingMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`weight` decimal(5,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rankingMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `rankingMetrics_metricName_unique` UNIQUE(`metricName`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `themePreference` enum('light','dark') DEFAULT 'light' NOT NULL;