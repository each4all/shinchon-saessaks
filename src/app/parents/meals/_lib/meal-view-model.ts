import type { MealPlan, MealPlanResource } from "@/lib/data/meal-plans-repository";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

export function isImageResource(resource: { fileUrl: string; mediaType?: string | null }) {
	if (!resource?.fileUrl) return false;
	if (resource.mediaType) {
		return resource.mediaType.startsWith("image");
	}
	try {
		const url = new URL(resource.fileUrl);
		const pathname = url.pathname.toLowerCase();
		return IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(`.${ext}`));
	} catch {
		const lower = resource.fileUrl.toLowerCase();
		return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(`.${ext}`));
	}
}

export type EnhancedMealPlan<T extends MealPlan = MealPlan> = T & {
	imageResources: MealPlanResource[];
	fileResources: MealPlanResource[];
};

export function enhanceMealPlans<T extends MealPlan>(mealPlans: T[]): EnhancedMealPlan<T>[] {
	return mealPlans.map((plan) => {
		const imageResources = plan.resources.filter(isImageResource);
		const fileResources = plan.resources.filter((resource) => !isImageResource(resource));
		return {
			...plan,
			imageResources,
			fileResources,
		};
	});
}

export type MealCalendarEvent = {
	id: string;
	menuDate: string;
	mealType: string;
	menuItems: string[];
	notes: string | null;
	audienceScope: string;
	allergens: string[];
	imageResources: MealPlanResource[];
	fileResources: MealPlanResource[];
};

export function toMealCalendarEvents(plans: EnhancedMealPlan[]): MealCalendarEvent[] {
	return plans.map((plan) => ({
		id: plan.id,
		menuDate: plan.menuDate.toISOString(),
		mealType: plan.mealType,
		menuItems: plan.menuItems,
		notes: plan.notes ?? null,
		audienceScope: plan.audienceScope,
		allergens: plan.allergens,
		imageResources: plan.imageResources,
		fileResources: plan.fileResources,
	}));
}

export function groupMealPlansByDate(plans: EnhancedMealPlan[]) {
	return plans.reduce<Record<string, { date: Date; items: EnhancedMealPlan[] }>>((acc, plan) => {
		const key = plan.menuDate.toISOString().slice(0, 10);
		if (!acc[key]) {
			acc[key] = { date: plan.menuDate, items: [] };
		}
		acc[key].items.push(plan);
		return acc;
	}, {});
}
