import type { Form_Questions } from "../../generated/prisma/types.js";
import type { Selectable } from "kysely";
import { z } from "zod";
import {
	contactInfoDataSchema,
	multiSelectDataSchema,
	numberDataSchema,
	longTextDataSchema,
	FieldAnswerSchema,
} from "./form.schema.js";

// Validation error type
export interface ValidationError {
	field: string;
	message: string;
	title?: string;
	questionId: string;
}

// Use schemas from form.schema.ts instead of duplicating them
// Basic answer validation schemas
const multiSelectSchema = z.array(z.string());
const numberSchema = z.union([
	z.number(),
	z.string().transform((val) => parseFloat(val)),
]);
const textSchema = z.string();

// Simple contact info answer schema for existing validation logic

// Helper function to convert Zod errors to ValidationError format
const formatZodErrors = (
	zodErrors: any[],
	questionId: string,
	fieldPrefix = "general"
): ValidationError[] => {
	return zodErrors.map((error) => ({
		field:
			error.path && error.path.length > 0 ? error.path.join(".") : fieldPrefix,
		message: error.message,
		questionId,
	}));
};

// Validate a single question's answer using Zod schemas
export const validateQuestionAnswer = (
	question: Selectable<Form_Questions>,
	answer: any
): ValidationError[] => {
	const errors: ValidationError[] = [];
	const questionId = question.id;

	// Check if answer exists for required questions
	const isEmpty =
		answer === null ||
		answer === undefined ||
		answer === "" ||
		(Array.isArray(answer) && answer.length === 0) ||
		(typeof answer === "object" &&
			answer !== null &&
			Object.keys(answer).length === 0);

	if (question.required && isEmpty) {
		errors.push({
			field: question.title || "general",
			message: "This field is required",
			questionId,
		});
		return errors;
	}

	// Skip validation if answer is empty and field is not required
	if (isEmpty) {
		return errors;
	}
	let questionData: Selectable<Form_Questions>;

	questionData =
		typeof question.data === "string"
			? JSON.parse(question.data)
			: question.data || {};

	// Type-specific validations using Zod
	switch (question.type) {
		case "CONTACT_INFO":
		case "ADDRESS":
			try {
				// Parse and validate question data structure
				const dataResult = contactInfoDataSchema.safeParse(questionData);
				if (!dataResult.success) {
					errors.push(
						...formatZodErrors(
							dataResult.error.issues,
							questionId,
							question.title || "questionData"
						)
					);
					break;
				}

				// Validate answer structure
				const answerResult = FieldAnswerSchema.safeParse(answer);
				if (!answerResult.success) {
					errors.push(
						...formatZodErrors(
							answerResult.error.issues,
							questionId,
							question.title || "general"
						)
					);
					break;
				}

				// Validate individual fields
				const { fields } = dataResult.data;
				const answerData = answerResult.data;

				for (const field of fields) {
					const fieldData = answerData[field.id] as
						| { value: string }
						| undefined;
					const fieldValue = fieldData?.value || "";

					if (field.required && !fieldValue.trim()) {
						errors.push({
							field: field.title,
							message: `${field.title} is required`,
							questionId,
						});
					}

					if (fieldValue && field.type === "email") {
						const emailResult = z
							.email("Please enter a valid email address")
							.safeParse(fieldValue);
						if (!emailResult.success) {
							errors.push({
								field: field.title,
								message: "Please enter a valid email address",
								questionId,
							});
						}
					}

					if (fieldValue && field.type === "tel") {
						const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
						if (!phoneRegex.test(fieldValue.replace(/[\s\-\(\)]/g, ""))) {
							errors.push({
								field: field.title,
								message: "Please enter a valid phone number",
								questionId,
							});
						}
					}
				}
			} catch (parseError) {
				errors.push({
					field: question.title || "general",
					message: `Invalid ${question.type.toLowerCase()} information format`,
					questionId,
				});
			}
			break;

		case "MULTI_SELECT_OPTION":
			try {
				// Parse and validate question data
				const dataResult = multiSelectDataSchema.safeParse(questionData);
				if (!dataResult.success) {
					errors.push(
						...formatZodErrors(
							dataResult.error.issues,
							questionId,
							question.title || "questionData"
						)
					);
					break;
				}

				// Validate answer is array of strings
				const answerResult = multiSelectSchema.safeParse(answer);
				if (!answerResult.success) {
					errors.push(
						...formatZodErrors(
							answerResult.error.issues,
							questionId,
							question.title || "general"
						)
					);
					break;
				}

				const selectedOptions = answerResult.data;
				const { selectionType, minSelections, maxSelections, fixedSelections } =
					dataResult.data;

				// Validate selection constraints
				if (selectionType === "fixed" && fixedSelections) {
					if (selectedOptions.length !== fixedSelections) {
						errors.push({
							field: question.title || "general",
							message: `Please select exactly ${fixedSelections} option(s). Currently ${selectedOptions.length} selected.`,
							questionId,
						});
					}
				} else if (selectionType === "range") {
					if (minSelections && selectedOptions.length < minSelections) {
						errors.push({
							field: question.title || "general",
							message: `Please select at least ${minSelections} option(s). Currently ${selectedOptions.length} selected.`,
							questionId,
						});
					}
					if (maxSelections && selectedOptions.length > maxSelections) {
						errors.push({
							field: question.title || "general",
							message: `Please select no more than ${maxSelections} option(s). Currently ${selectedOptions.length} selected.`,
							questionId,
						});
					}
				}

				if (question.required && selectedOptions.length === 0) {
					errors.push({
						field: question.title || "general",
						message: "Please select at least one option",
						questionId,
					});
				}
			} catch (parseError) {
				errors.push({
					field: question.title || "general",
					message: "Invalid multi-select format",
					questionId,
				});
			}
			break;

		case "NUMBER":
			try {
				// Parse and validate question data
				const dataResult = numberDataSchema.safeParse(questionData);
				if (!dataResult.success) {
					errors.push(
						...formatZodErrors(
							dataResult.error.issues,
							questionId,
							question.title || "questionData"
						)
					);
					break;
				}

				// Validate answer is a number
				const answerResult = numberSchema.safeParse(answer);
				if (!answerResult.success) {
					errors.push({
						field: question.title || "general",
						message: "Please enter a valid number",
						questionId,
					});
					break;
				}

				const numValue = answerResult.data;
				const { minValue, maxValue } = dataResult.data;

				// Validate range constraints
				if (minValue !== undefined && numValue < minValue) {
					errors.push({
						field: question.title || "general",
						message: `Value must be at least ${minValue}`,
						questionId,
					});
				}
				if (maxValue !== undefined && numValue > maxValue) {
					errors.push({
						field: question.title || "general",
						message: `Value must be no more than ${maxValue}`,
						questionId,
					});
				}
			} catch (parseError) {
				errors.push({
					field: question.title || "general",
					message: "Invalid number format",
					questionId,
				});
			}
			break;

		case "LONG_TEXT":
			try {
				// Parse and validate question data
				const dataResult = longTextDataSchema.safeParse(questionData);
				if (!dataResult.success) {
					errors.push(
						...formatZodErrors(
							dataResult.error.issues,
							questionId,
							question.title || "questionData"
						)
					);
					break;
				}

				// Validate answer is a string
				const answerResult = textSchema.safeParse(answer);
				if (!answerResult.success) {
					errors.push({
						field: question.title || "general",
						message: "Please enter valid text",
						questionId,
					});
					break;
				}

				const textValue = answerResult.data.trim();
				const { minLength, maxLength } = dataResult.data;

				// Validate length constraints
				if (textValue) {
					const textLength = textValue.length;

					if (minLength !== undefined && textLength < minLength) {
						errors.push({
							field: question.title || "general",
							message: `Text must be at least ${minLength} characters long. Currently ${textLength} characters.`,
							questionId,
						});
					}

					if (maxLength !== undefined && textLength > maxLength) {
						errors.push({
							field: question.title || "general",
							message: `Text must be no more than ${maxLength} characters long. Currently ${textLength} characters.`,
							questionId,
						});
					}
				}
			} catch (parseError) {
				errors.push({
					field: question.title || "general",
					message: "Invalid text format",
					questionId,
				});
			}
			break;

		case "SHORT_TEXT":
			try {
				// Validate answer is a string
				const answerResult = textSchema.safeParse(answer);
				if (!answerResult.success) {
					errors.push({
						field: question.title || "general",
						message: "Please enter valid text",
						questionId,
					});
				}
			} catch (parseError) {
				errors.push({
					field: question.title || "general",
					message: "Invalid text format",
					questionId,
				});
			}
			break;

		default:
			// For other question types, basic validation
			break;
	}

	return errors;
};

// Validate all form responses
export const validateFormResponses = (
	formQuestions: Selectable<Form_Questions>[],
	answers: Array<{
		form_question_id: string;
		answer: any;
	}>
): ValidationError[] => {
	const allValidationErrors: ValidationError[] = [];

	for (const question of formQuestions) {
		// Find the corresponding answer for this question
		const submittedAnswer = answers.find(
			(ans) => ans.form_question_id === question.id
		);

		// Parse the answer or use null if not provided
		let answerValue = null;
		if (submittedAnswer) {
			try {
				// If answer is already an object, use it directly
				answerValue =
					typeof submittedAnswer.answer === "string"
						? JSON.parse(submittedAnswer.answer)
						: submittedAnswer.answer;
			} catch {
				answerValue = submittedAnswer.answer;
			}
		}

		// Validate this question's answer
		const questionErrors = validateQuestionAnswer(question, answerValue);
		allValidationErrors.push(...questionErrors);
	}

	return allValidationErrors;
};
