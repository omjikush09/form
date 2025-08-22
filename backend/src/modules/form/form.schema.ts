import { z } from "zod";

// Form Settings Schema
export const FormSettingsSchema = z.object({
	backgroundColor: z.string(),
	questionColor: z.string(),
	descriptionColor: z.string(),
	answerColor: z.string(),
	buttonColor: z.string(),
	buttonTextColor: z.string(),
	fontFamily: z.string(),
});

// Create Form Request Body Schema
export const CreateFormBodySchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	title: z.string().min(1, "Title is required"),
	status: z.enum(["PUBLISHED", "DRAFT", "CLOSED"]),
	settings: FormSettingsSchema,
});

// Update Form Request Body Schema
export const UpdateFormBodySchema = CreateFormBodySchema.partial();

// Form ID Parameter Schema
export const FormIdParamSchema = z.object({
	formId: z.string().min(1, "Form ID is required"),
});

// User ID Parameter Schema
export const UserIdParamSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export const contactInfoFieldSchema = z.object({
	id: z.string(),
	title: z.string(),
	type: z.enum(["text", "email", "tel", "number"]),
	display: z.boolean().default(true),
	required: z.boolean().default(false),
	placeholder: z.string(),
});

// Question data schemas based on TypeScript types
export const shortTextDataSchema = z.object({
	placeholder: z.string(),
});

export const longTextDataSchema = z.object({
	placeholder: z.string().optional(),
	minLength: z.number().optional(),
	maxLength: z.number().optional(),
	size: z.enum(["medium", "small", "large", "very-large"]),
});

export const numberDataSchema = z.object({
	placeholder: z.string().optional(),
	minValue: z.number().optional(),
	maxValue: z.number().optional(),
});

export const urlDataSchema = z.object({
	placeholder: z.string(),
});

export const dateDataSchema = z.object({
	placeholder: z.string(),
	minDate: z.string().optional(),
	maxDate: z.string().optional(),
});

export const optionSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.string(),
});

export const dropdownDataSchema = z.object({
	options: z.array(optionSchema),
	placeholder: z.string().optional(),
});

export const singleSelectDataSchema = z.object({
	options: z.array(optionSchema),
	allowOther: z.boolean().optional(),
});

export const multiSelectDataSchema = z.object({
	options: z.array(optionSchema),
	selectionType: z.enum(["unlimited", "fixed", "range"]),
	minSelections: z.number().optional(),
	maxSelections: z.number().optional(),
	fixedSelections: z.number().optional(),
	allowOther: z.boolean().optional(),
});

export const contactInfoDataSchema = z.object({
	fields: z.array(contactInfoFieldSchema),
});

export const addressDataSchema = z.object({
	fields: z.array(contactInfoFieldSchema),
});

export const statementDataSchema = z.object({});

export const startStepDataSchema = z.object({});

export const endStepDataSchema = z.object({});

const BaseQuestionSchema = z.object({
	id: z.string().optional(),
	step: z.number(),
	title: z.string(),
	description: z.string(),
	required: z.boolean(),
	buttonText: z.string().nullable().optional(),
});

export const QuestionSchema = BaseQuestionSchema.and(
	z.discriminatedUnion("type", [
		z.object({
			type: z.literal("SHORT_TEXT"),
			data: shortTextDataSchema,
		}),
		z.object({
			type: z.literal("LONG_TEXT"),
			data: longTextDataSchema,
		}),
		z.object({
			type: z.literal("NUMBER"),
			data: numberDataSchema,
		}),
		z.object({
			type: z.literal("DATE"),
			data: dateDataSchema,
		}),
		z.object({
			type: z.literal("URL"),
			data: urlDataSchema,
		}),
		z.object({
			type: z.literal("SINGLE_SELECT_OPTION"),
			data: singleSelectDataSchema,
		}),
		z.object({
			type: z.literal("MULTI_SELECT_OPTION"),
			data: multiSelectDataSchema,
		}),
		z.object({
			type: z.literal("DROPDOWN"),
			data: dropdownDataSchema,
		}),
		z.object({
			type: z.literal("CONTACT_INFO"),
			data: contactInfoDataSchema,
		}),
		z.object({
			type: z.literal("ADDRESS"),
			data: addressDataSchema,
		}),
		z.object({
			type: z.literal("STATEMENT"),
			data: statementDataSchema,
		}),
		z.object({
			type: z.literal("START_STEP"),
			data: startStepDataSchema,
		}),
		z.object({
			type: z.literal("END_STEP"),
			data: endStepDataSchema,
		}),
	])
);

// Publish Form with Questions Request Body Schema
export const PublishFormBodySchema = z.object({
	questions: z
		.array(QuestionSchema)
		.min(1, "At least one question is required"),
});

export const FieldAnswerSchema = z.record(
	z.string(),
	z.object({
		value: z.string(),
		type: z.enum(["tel", "number", "text", "email"]),
		title: z.string(),
	})
);

// This is basic validation
const AnswerSchema = z.object({
	form_question_id: z.string().min(1, "Question ID is required"),
	answer: z.union([
		// String answers (SHORT_TEXT, LONG_TEXT, NUMBER, DATE, URL, SINGLE_SELECT, DROPDOWN)
		z.string(),
		// Array answers (MULTI_SELECT_OPTION)
		z.array(z.string()),
		// Contact info/Address answers
		FieldAnswerSchema,
	]),
});

// Submit Form Response Request Body Schema
export const SubmitFormResponseBodySchema = z.object({
	answers: z.array(AnswerSchema),
});

// Combined validation schemas for each route
export const FormValidationSchemas = {
	// POST / - Create Form
	createForm: {
		body: CreateFormBodySchema,
	},

	// GET /user/:userId - Get Forms by User
	getFormsByUser: {
		params: UserIdParamSchema,
	},

	// GET /:formId - Get Form by ID
	getFormById: {
		params: FormIdParamSchema,
	},

	// PUT /:formId - Update Form
	updateForm: {
		params: FormIdParamSchema,
		body: UpdateFormBodySchema,
	},

	// DELETE /:formId - Delete Form
	deleteForm: {
		params: FormIdParamSchema,
	},

	// GET /:formId/questions - Get Form Questions
	getFormQuestions: {
		params: FormIdParamSchema,
	},

	// POST /:formId/publish-with-questions - Publish Form with Questions
	publishFormWithQuestions: {
		params: FormIdParamSchema,
		body: PublishFormBodySchema,
	},

	// POST /:formId/responses - Submit Form Response
	submitFormResponse: {
		params: FormIdParamSchema,
		body: SubmitFormResponseBodySchema,
	},
} as const;
