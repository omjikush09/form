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
						type: z.enum(["tel", "number", "text", "email"]),
						title: z.string(),
					})
				);

				// Add validation for individual fields if needed
				if (step.data?.fields && Array.isArray(step.data.fields)) {
					const refinedSchema = contactInfoSchema.superRefine((data, ctx) => {
						step.data.fields.forEach((field) => {
							const fieldData = data[field.id];
							const fieldValue = fieldData?.value || "";

							// Required field validation
							if (field.required && !fieldValue.trim()) {
								ctx.addIssue({
									code: "custom",
									path: [field.id, "value"],
									message: `${field.title || field.id} is required`,
								});
							}

							// Email validation using Zod's built-in email validator
							if (fieldValue && field.type === "email") {
								const emailResult = z
									.email({
										message: "Please enter a valid email address",
									})
									.safeParse(fieldValue);
								if (!emailResult.success) {
									ctx.addIssue({
										code: "custom",
										path: [field.id, "value"],
										message: `Please enter a valid email address for ${
											field.title || field.id
										}`,
									});
								}
							}

							// Phone validation
							if (fieldValue && field.type === "tel") {
								const phoneResult = z
									.string()
									.regex(
										/^[\+]?[1-9][\d]{0,15}$/,
										"Invalid phone number format"
									)
									.safeParse(fieldValue.replace(/[\s\-\(\)]/g, ""));
								if (!phoneResult.success) {
									ctx.addIssue({
										code: z.ZodIssueCode.custom,
										path: [field.id, "value"],
										message: `Please enter a valid phone number for ${
											field.title || field.id
										}`,
									});
								}
							}
						});
					});

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

				// Add default value at the end and assign to schema fields
				schemaFields[fieldKey] = multiSelectSchema.default([]);
				break;

			case "NUMBER":
				let numberSchema = z.coerce.number({
					message: "Please enter a valid number",
				});

				// Add range constraints using Zod's built-in validators
				if (step.data?.minValue !== undefined) {
					numberSchema = numberSchema.min(
						step.data.minValue,
						`Value must be at least ${step.data.minValue}`
					);
				}

				if (step.data?.maxValue !== undefined) {
					numberSchema = numberSchema.max(
						step.data.maxValue,
						`Value must be no more than ${step.data.maxValue}`
					);
				}

				schemaFields[fieldKey] = step.required
					? numberSchema
					: numberSchema.optional();
				break;

			case "LONG_TEXT":
				let longTextSchema = z.string();

				// Add length constraints using Zod's built-in validators
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

				// Handle required validation using trim for better UX
				if (step.required) {
					longTextSchema = longTextSchema
						.trim()
						.min(1, "This field is required");
				}

				schemaFields[fieldKey] = step.required
					? longTextSchema
					: longTextSchema.optional();
				break;

			case "SHORT_TEXT":
				let shortTextSchema = z.string();

				// Handle required validation using Zod's built-in methods
				if (step.required) {
					shortTextSchema = shortTextSchema
						.trim()
						.min(1, "This field is required");
				}

				schemaFields[fieldKey] = step.required
					? shortTextSchema
					: shortTextSchema.optional();
				break;

			case "URL":
				let urlSchema = z.url({
					message: "Please enter a valid URL",
				});

				// Handle required validation
				if (step.required) {
					urlSchema = urlSchema.min(1, "This field is required");
				}

				schemaFields[fieldKey] = step.required
					? urlSchema
					: urlSchema.optional();
				break;

			case "DATE":
				let dateSchema = z.string();

				// Handle required validation
				if (step.required) {
					dateSchema = dateSchema.min(1, "This field is required");
				}

				schemaFields[fieldKey] = step.required
					? dateSchema
					: dateSchema.optional();
				break;

			default:
				// For other types, basic string validation
				let defaultSchema = z.string();

				// Handle required validation using Zod's built-in methods
				if (step.required) {
					defaultSchema = defaultSchema.trim().min(1, "This field is required");
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
