import { z } from "zod";
import type { FormAnswer } from "@/context/FormAnswerContext";

// Validation error type
export type ValidationError = {
	field: string;
	message: string;
};

// Zod validation schemas
const contactInfoFieldSchema = z.object({
	id: z.string(),
	title: z.string(),
	type: z.enum(["text", "email", "tel", "number"]),
	display: z.boolean().default(true),
	required: z.boolean().default(false),
	placeholder: z.string().optional(),
});

const contactInfoSchema = z.record(
	z.string(),
	z.object({
		value: z.string(),
		title: z.string(),
	})
);

const multiSelectSchema = z.array(z.string());

const numberSchema = z.union([
	z.number(),
	z.string().transform((val: string) => parseFloat(val)),
]);

const textSchema = z.string();

const contactInfoDataSchema = z.object({
	fields: z.array(contactInfoFieldSchema),
});

const multiSelectDataSchema = z.object({
	selectionType: z.enum(["unlimited", "fixed", "range"]).default("unlimited"),
	minSelections: z.number().optional(),
	maxSelections: z.number().optional(),
	fixedSelections: z.number().optional(),
});

const numberDataSchema = z.object({
	minValue: z.number().optional(),
	maxValue: z.number().optional(),
});

const longTextDataSchema = z.object({
	minLength: z.number().optional(),
	maxLength: z.number().optional(),
});

// Helper function to format Zod errors
const formatZodErrors = (zodErrors: any[], fieldPrefix = "general"): ValidationError[] => {
	return zodErrors.map((error) => ({
		field: error.path && error.path.length > 0 ? error.path.join(".") : fieldPrefix,
		message: error.message,
	}));
};

// Individual validation functions for each form type

// Contact Info and Address validation
export const validateContactInfo = (
	answer: any,
	questionData: any
): ValidationError[] => {
	const errors: ValidationError[] = [];

	try {
		// Parse and validate question data structure
		const dataResult = contactInfoDataSchema.safeParse(questionData.data);
		if (!dataResult.success) {
			errors.push(...formatZodErrors(dataResult.error.issues, "questionData"));
			return errors;
		}

		// Validate answer structure
		const answerResult = contactInfoSchema.safeParse(answer);
		if (!answerResult.success) {
			errors.push(...formatZodErrors(answerResult.error.issues, "general"));
			return errors;
		}

		// Validate individual fields
		const { fields } = dataResult.data;
		const answerData = answerResult.data;

		for (const field of fields) {
			const fieldData = answerData[field.id] as { value: string } | undefined;
			const fieldValue = fieldData?.value || "";

			if (field.required && !fieldValue.trim()) {
				errors.push({
					field: field.title,
					message: `${field.title} is required`,
				});
			}

			if (fieldValue && field.type === "email") {
				const emailResult = z.string().email({ message: "Please enter a valid email address" }).safeParse(fieldValue);
				if (!emailResult.success) {
					errors.push({
						field: field.title || "general",
						message: "Please enter a valid email address",
					});
				}
			}

			if (fieldValue && field.type === "tel") {
				const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
				if (!phoneRegex.test(fieldValue.replace(/[\s\-\(\)]/g, ""))) {
					errors.push({
						field: field.title,
						message: "Please enter a valid phone number",
					});
				}
			}
		}
	} catch (parseError) {
		errors.push({
			field: "general",
			message: `Invalid ${questionData.type.toLowerCase()} information format`,
		});
	}

	return errors;
};

// Multi-select validation
export const validateMultiSelect = (
	answer: any,
	questionData: any
): ValidationError[] => {
	const errors: ValidationError[] = [];

	try {
		// Parse and validate question data
		const dataResult = multiSelectDataSchema.safeParse(questionData.data);
		if (!dataResult.success) {
			errors.push(...formatZodErrors(dataResult.error.issues, "questionData"));
			return errors;
		}

		// Validate answer is array of strings
		const answerResult = multiSelectSchema.safeParse(answer);
		if (!answerResult.success) {
			errors.push(...formatZodErrors(answerResult.error.issues, "general"));
			return errors;
		}

		const selectedOptions = answerResult.data;
		const { selectionType, minSelections, maxSelections, fixedSelections } = dataResult.data;

		// Validate selection constraints
		if (selectionType === "fixed" && fixedSelections) {
			if (selectedOptions.length !== fixedSelections) {
				errors.push({
					field: "general",
					message: `Please select exactly ${fixedSelections} option(s). Currently ${selectedOptions.length} selected.`,
				});
			}
		} else if (selectionType === "range") {
			if (minSelections && selectedOptions.length < minSelections) {
				errors.push({
					field: "general",
					message: `Please select at least ${minSelections} option(s). Currently ${selectedOptions.length} selected.`,
				});
			}
			if (maxSelections && selectedOptions.length > maxSelections) {
				errors.push({
					field: "general",
					message: `Please select no more than ${maxSelections} option(s). Currently ${selectedOptions.length} selected.`,
				});
			}
		}

		if (questionData.required && selectedOptions.length === 0) {
			errors.push({
				field: "general",
				message: "Please select at least one option",
			});
		}
	} catch (parseError) {
		errors.push({
			field: "general",
			message: "Invalid multi-select format",
		});
	}

	return errors;
};

// Number validation
export const validateNumber = (
	answer: any,
	questionData: any
): ValidationError[] => {
	const errors: ValidationError[] = [];

	try {
		// Parse and validate question data
		const dataResult = numberDataSchema.safeParse(questionData.data);
		if (!dataResult.success) {
			errors.push(...formatZodErrors(dataResult.error.issues, "questionData"));
			return errors;
		}

		// Validate answer is a number
		const answerResult = numberSchema.safeParse(answer);
		if (!answerResult.success) {
			errors.push({
				field: "general",
				message: "Please enter a valid number",
			});
			return errors;
		}

		const numValue = answerResult.data;
		const { minValue, maxValue } = dataResult.data;

		// Validate range constraints
		if (minValue !== undefined && numValue < minValue) {
			errors.push({
				field: "general",
				message: `Value must be at least ${minValue}`,
			});
		}
		if (maxValue !== undefined && numValue > maxValue) {
			errors.push({
				field: "general",
				message: `Value must be no more than ${maxValue}`,
			});
		}
	} catch (parseError) {
		errors.push({
			field: "general",
			message: "Invalid number format",
		});
	}

	return errors;
};

// Long text validation
export const validateLongText = (
	answer: any,
	questionData: any
): ValidationError[] => {
	const errors: ValidationError[] = [];

	try {
		// Parse and validate question data
		const dataResult = longTextDataSchema.safeParse(questionData.data);
		if (!dataResult.success) {
			errors.push(...formatZodErrors(dataResult.error.issues, "questionData"));
			return errors;
		}

		// Validate answer is a string
		const answerResult = textSchema.safeParse(answer);
		if (!answerResult.success) {
			errors.push({
				field: "general",
				message: "Please enter valid text",
			});
			return errors;
		}

		const textValue = answerResult.data.trim();
		const { minLength, maxLength } = dataResult.data;

		// Validate length constraints
		if (textValue) {
			const textLength = textValue.length;

			if (minLength !== undefined && textLength < minLength) {
				errors.push({
					field: "general",
					message: `Text must be at least ${minLength} characters long. Currently ${textLength} characters.`,
				});
			}

			if (maxLength !== undefined && textLength > maxLength) {
				errors.push({
					field: "general",
					message: `Text must be no more than ${maxLength} characters long. Currently ${textLength} characters.`,
				});
			}
		}
	} catch (parseError) {
		errors.push({
			field: "general",
			message: "Invalid text format",
		});
	}

	return errors;
};

// Short text validation
export const validateShortText = (
	answer: any,
	questionData: any
): ValidationError[] => {
	const errors: ValidationError[] = [];

	try {
		// Validate answer is a string
		const answerResult = textSchema.safeParse(answer);
		if (!answerResult.success) {
			const fieldName = questionData.title || "general";
			errors.push({
				field: fieldName,
				message: "Please enter valid text",
			});
		}
	} catch (parseError) {
		const fieldName = questionData.title || "general";
		errors.push({
			field: fieldName,
			message: "Invalid text format",
		});
	}

	return errors;
};

// Generic validation for other types
export const validateGeneric = (
	_answer: any,
	_questionData: any
): ValidationError[] => {
	// For other question types, basic validation is handled by the main function
	return [];
};

// Validation function mapping
const validationFunctions = {
	CONTACT_INFO: validateContactInfo,
	ADDRESS: validateContactInfo,
	MULTI_SELECT_OPTION: validateMultiSelect,
	NUMBER: validateNumber,
	LONG_TEXT: validateLongText,
	SHORT_TEXT: validateShortText,
} as const;

// Main validation function that delegates to specific validators
export const validateQuestion = (
	questionId: string,
	questionData: any,
	getAnswer: (questionId: string) => FormAnswer | undefined
): ValidationError[] => {
	const errors: ValidationError[] = [];
	const answer = getAnswer(questionId);

	// Check if answer exists for required questions
	const isEmpty = answer === null || answer === undefined || 
		answer.answer === null || answer.answer === undefined || 
		answer.answer === "" || 
		(Array.isArray(answer.answer) && answer.answer.length === 0) ||
		(typeof answer.answer === "object" && answer.answer !== null && Object.keys(answer.answer).length === 0);

	if (questionData.required && isEmpty) {
		errors.push({
			field: "general",
			message: "This field is required"
		});
		return errors;
	}

	// Skip validation if answer is empty and field is not required
	if (isEmpty) {
		return errors;
	}

	// Get the specific validation function for this question type
	const validationFunction = validationFunctions[questionData.type as keyof typeof validationFunctions];
	
	if (validationFunction) {
		// Call the specific validation function
		const validationErrors = validationFunction(answer.answer, questionData);
		errors.push(...validationErrors);
	} else {
		// For other question types, use generic validation
		const genericErrors = validateGeneric(answer.answer, questionData);
		errors.push(...genericErrors);
	}

	return errors;
};

// Helper function to check if a question can proceed to next
export const canProceedToNext = (
	questionId: string,
	questionData: any,
	getAnswer: (questionId: string) => FormAnswer | undefined
): boolean => {
	const errors = validateQuestion(questionId, questionData, getAnswer);
	return errors.length === 0;
};