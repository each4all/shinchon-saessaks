"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
	return (
		<div
			data-slot="table-container"
			className="relative w-full overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-white/85 shadow-[var(--shadow-soft)] backdrop-blur-sm"
		>
			<table
				data-slot="table"
				className={cn("w-full caption-bottom text-sm text-[var(--brand-navy)]", className)}
				{...props}
			/>
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
	return (
		<thead
			data-slot="table-header"
			className={cn("[&_tr]:border-b", className)}
			{...props}
		/>
	);
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
	return (
		<tbody
			data-slot="table-body"
			className={cn("[&_tr:last-child]:border-0", className)}
			{...props}
		/>
	);
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn(
				"border-t bg-[rgba(129,87,236,0.08)] font-medium [&>tr]:last:border-b-0",
				className,
			)}
			{...props}
		/>
	);
}

interface TableRowProps extends React.ComponentProps<"tr"> {
	disableHover?: boolean;
}

function TableRow({ className, disableHover = false, ...props }: TableRowProps) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				"border-b transition-colors data-[state=selected]:bg-[rgba(255,72,65,0.12)]",
				!disableHover && "hover:bg-[rgba(129,87,236,0.07)]",
				className,
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"h-12 px-[var(--space-sm)] text-left align-middle font-semibold uppercase tracking-wide text-[var(--brand-navy)]/80 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				"px-[var(--space-sm)] py-[var(--space-2xs)] align-middle text-sm text-[var(--brand-navy)]/90 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
				className,
			)}
			{...props}
		/>
	);
}

function TableCaption({
	className,
	...props
}: React.ComponentProps<"caption">) {
	return (
		<caption
			data-slot="table-caption"
			className={cn("mt-[var(--space-sm)] text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};
