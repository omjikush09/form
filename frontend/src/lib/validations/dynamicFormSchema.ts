import { z } from "zod";
import { FormElementConfig } from "@/context/FormStepDataContext";

// Create dynamic form schema based on form step data
export const createDynamicFormSchema = (formStepData: FormElementConfig[]) => {
	const schemaFields: Record<string, z.ZodType> = {};

	// Filter out START_STEP and END_STEP
	const validatableSteps = formStepData.filter(
		(step) => step.type !== "START_STEP" && step.type !== "END_STEP"
	);

	validatableSteps.forEach((step) => {
		if (!step.id) return;

		const fieldKey = step.id;

		switch (step.type) {
			case "CONTACT_INFO":
			case "ADDRESS":
				// Create a schema for the contact info object structure
				// This matches the FormAnswer structure: { [fieldId]: { value: string, title: string } }
				const contactInfoSchema = z.record(
					z.string(),
					z.object({
						value: z.string(),
						title: z.string(),
					})
				);

				// Add validation for individual fields if needed
				if (step.data?.fields && Array.isArray(step.data.fields)) {
					const refinedSchema = contactInfoSchema.refine(
						(data) => {
							const errors: string[] = [];

							step.data.fields.forEach((field) => {
								const fieldData = data[field.id];
								const fieldValue = fieldData?.value || "";

								// Required field validation
								if (field.required && !fieldValue.trim()) {
									errors.push(`${field.title || field.id} is required`);
								}

								// Email validation
								if (fieldValue && field.type === "email") {
									const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
									if (!emailRegex.test(fieldValue)) {
										errors.push(
											`Please enter a valid email address for ${
												field.title || field.id
											}`
										);
									}
								}

								// Phone validation
								if (fieldValue && field.type === "tel") {
									const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
									if (!phoneRegex.test(fieldValue.replace(/[\s\-\(\)]/g, ""))) {
										errors.push(
											`Please enter a valid phone number for ${
												field.title || field.id
											}`
										);
									}
								}
							});

							return errors.length === 0;
						},
						{
							message: "Please fix the contact information errors",
						}
					);

					schemaFields[fieldKey] = step.required
						? refinedSchema
						: refinedSchema.optional();
				} else {
					schemaFields[fieldKey] = step.required
						? contactInfoSchema
						: contactInfoSchema.optional();
				}
				break;

			case "MULTI_SELECT_OPTION":
				let multiSelectSchema = z.array(z.string());

				// Add selection constraints
				if (
					step.data?.selectionType === "fixed" &&
					step.data?.fixedSelections
				) {
					multiSelectSchema = multiSelectSchema.length(
						step.data.fixedSelections,
						`Please select exactly ${step.data.fixedSelections} option(s)`
					);
				} else if (step.data?.selectionType === "range") {
					if (step.data?.minSelections) {
						multiSelectSchema = multiSelectSchema.min(
							step.data.minSelections,
							`Please select at least ${step.data.minSelections} option(s)`
						);
					}
					if (step.data?.maxSelections) {
						multiSelectSchema = multiSelectSchema.max(
							step.data.maxSelections,
							`Please select no more than ${step.data.maxSelections} option(s)`
						);
					}
				}

				// Handle required validation
				if (step.required) {
					multiSelectSchema = multiSelectSchema.refine(
						(value) => value.length > 0,
						"Please select at least one option"
					);
				}

				schemaFields[fieldKey] = step.required
					? multiSelectSchema
					: multiSelectSchema.optional().default([]);
				break;

			case "NUMBER":
				let numberSchema = z.union([
					z.number(),
					z.string().transform((val) => {
						const parsed = parseFloat(val);
						if (isNaN(parsed)) {
							throw new Error("Please enter a valid number");
						}
						return parsed;
					}),
				]);

				// Add range constraints
				if (step.data?.minValue !== undefined) {
					numberSchema = numberSchema.refine(
						(val) => val >= step?.data?.minValue!,
						`Value must be at least ${step.data.minValue}`
					);
				}

				if (step.data?.maxValue !== undefined) {
					numberSchema = numberSchema.refine(
						(val) => val <= step.data.maxValue!,
						`Value must be no more than ${step.data.maxValue}`
					);
				}

				schemaFields[fieldKey] = step.required
					? numberSchema
					: numberSchema.optional();
				break;

			case "LONG_TEXT":
				let longTextSchema = z.string();

				// Add length constraints
				if (step.data?.minLength) {
					longTextSchema = longTextSchema.min(
						step.data.minLength,
						`Text must be at least ${step.data.minLength} characters long`
					);
				}

				if (step.data?.maxLength) {
					longTextSchema = longTextSchema.max(
						step.data.maxLength,
						`Text must be no more than ${step.data.maxLength} characters long`
					);
				}

				// Handle required validation
				if (step.required) {
					longTextSchema = longTextSchema.refine(
						(val) => val.trim().length > 0,
						"This field is required"
					);
				}

				schemaFields[fieldKey] = step.required
					? longTextSchema
					: longTextSchema.optional();
				break;

			case "SHORT_TEXT":
				let shortTextSchema = z.string();

				// Handle required validation
				if (step.required) {
					shortTextSchema = shortTextSchema.refine(
						(val) => val.trim().length > 0,
						"This field is required"
					);
				}

				schemaFields[fieldKey] = step.required
					? shortTextSchema
					: shortTextSchema.optional();
				break;

			default:
				// For other types, basic string validation
				let defaultSchema = z.string();

				// Handle required validation
				if (step.required) {
					defaultSchema = defaultSchema.refine(
						(val) => val.trim().length > 0,
						"This field is required"
					);
				}

				schemaFields[fieldKey] = step.required
					? defaultSchema
					: defaultSchema.optional();
				break;
		}
	});

	return z.object(schemaFields);
};

// Type helper to infer form data type
export type DynamicFormData = z.infer<
	ReturnType<typeof createDynamicFormSchema>
>;
