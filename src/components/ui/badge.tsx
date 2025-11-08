import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center gap-1 rounded-[var(--radius-pill)] border px-[var(--space-sm)] py-[0.35rem] text-[11px] font-semibold leading-none normal-case tracking-[0.08em] whitespace-nowrap transition-[background,color,box-shadow,transform] duration-200 [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:size-3 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-60",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-[var(--brand-primary)] text-white [a&]:hover:brightness-110",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground [a&]:hover:brightness-110",
				sunshine:
					"border-transparent bg-[var(--brand-sunshine)] text-[var(--accent-foreground)] [a&]:hover:brightness-110",
				mint:
					"border-transparent bg-[var(--brand-mint)] text-[var(--brand-navy)] [a&]:hover:brightness-105",
				outline:
					"border-[var(--border)] bg-white/70 text-[var(--brand-navy)] [a&]:hover:bg-white",
				ghost:
					"border-transparent bg-transparent text-[var(--brand-navy)] [a&]:hover:bg-[rgba(241,239,255,0.6)]",
				info:
					"border-transparent bg-[var(--info)] text-white [a&]:hover:brightness-110",
				success:
					"border-transparent bg-[var(--success)] text-[var(--brand-navy)] [a&]:hover:brightness-110",
				warning:
					"border-transparent bg-[var(--warning)] text-[var(--brand-navy)] [a&]:hover:brightness-110",
				destructive:
					"border-transparent bg-destructive text-white [a&]:hover:brightness-110 focus-visible:ring-destructive/25 dark:focus-visible:ring-destructive/40",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
