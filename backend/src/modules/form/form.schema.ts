import { z } from "zod";

// Form Settings Schema
export const FormSettingsSchema = z.object({
	backgroundColor: z.string().optional(),
	questionColor: z.string().optional(),
	descriptionColor: z.string().optional(),
	answerColor: z.string().optional(),
	buttonColor: z.string().optional(),
	buttonTextColor: z.string().optional(),
	fontFamily: z.string().optional(),
});

// Create Form Request Body Schema
export const CreateFormBodySchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	title: z.string().min(1, "Title is required"),
	settings: FormSettingsSchema.optional(),
});

// Update Form Request Body Schema
export const UpdateFormBodySchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	settings: FormSettingsSchema.optional(),
});

// Form ID Parameter Schema
export const FormIdParamSchema = z.object({
	formId: z.string().min(1, "Form ID is required"),
});

// User ID Parameter Schema  
export const UserIdParamSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

// Question Schema for publishing forms
export const QuestionSchema = z.object({
	id: z.string().optional(),
	step: z.number(),
	type: z.string(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	required: z.boolean().optional(),
	buttonText: z.string().nullable().optional(),
	data: z.any().optional(), // Can be more specific based on question types
});

// Publish Form with Questions Request Body Schema
export const PublishFormBodySchema = z.object({
	questions: z.array(QuestionSchema).min(1, "At least one question is required"),
});

// Form Answer Schema for submissions
export const FormAnswerSchema = z.object({
	form_question_id: z.string().min(1, "Question ID is required"),
	answer: z.any(), // Can be string, number, array, or object depending on question type
});

// Submit Form Response Request Body Schema
export const SubmitFormResponseBodySchema = z.object({
	answers: z.array(FormAnswerSchema).min(1, "At least one answer is required"),
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

// Export individual schemas for backward compatibility
export const FormSchemas = {
	CreateFormBody: CreateFormBodySchema,
	UpdateFormBody: UpdateFormBodySchema,
	FormIdParam: FormIdParamSchema,
	UserIdParam: UserIdParamSchema,
	PublishFormBody: PublishFormBodySchema,
	SubmitFormResponseBody: SubmitFormResponseBodySchema,
} as const;