import type { Request, Response } from "express";
import {
	createFormService,
	getFormsByUserService,
	getFormByIdService,
	updateFormService,
	deleteFormService,
	getFormQuestionsService,
	publishFormWithQuestionsService,
	submitFormResponseService,
} from "./form.service.js";
import { validateFormResponses } from "./form.validations.js";

export const createForm = async (req: Request, res: Response) => {
	try {
		const { userId, title, settings } = req.validatedBody;

		const form = await createFormService(userId, title, settings);
		res.status(201).json({
			data: form,
			message: "Form created successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const getFormsByUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.validatedParams;
		const forms = await getFormsByUserService(userId);
		res.json({
			data: forms,
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const getFormById = async (req: Request, res: Response) => {
	try {
		const { formId } = req.validatedParams;
		const form = await getFormByIdService(formId);

		if (!form) {
			return res.status(404).json({
				error: "Form not found",
			});
		}

		res.json({
			data: form,
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const updateForm = async (req: Request, res: Response) => {
	try {
		const { formId } = req.validatedParams;
		const updates = req.validatedBody;

		const form = await updateFormService(formId, updates);
		res.json({
			data: form,
			message: "Form updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const deleteForm = async (req: Request, res: Response) => {
	try {
		const { formId } = req.validatedParams;
		await deleteFormService(formId);
		res.json({
			message: "Form deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const getFormQuestions = async (req: Request, res: Response) => {
	try {
		const { formId } = req.validatedParams;
		const questions = await getFormQuestionsService(formId);
		res.json({
			data: questions,
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const publishFormWithQuestions = async (req: Request, res: Response) => {
	try {
		const { formId } = req.validatedParams;
		const { questions } = req.validatedBody;
		console.log(req.validatedBody);
		const result = await publishFormWithQuestionsService(formId, questions);
		res.json({
			data: result,
			message: "Form published successfully with questions",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const submitFormResponse = async (req: Request, res: Response) => {
	try {
		const { formId } = req.validatedParams;
		const { answers } = req.validatedBody;

		// Fetch form questions from the database
		const formQuestions = await getFormQuestionsService(formId);
		
		// Filter out START_STEP and END_STEP questions for validation
		const validatableQuestions = formQuestions.filter(
			(question) => question.type !== "START_STEP" && question.type !== "END_STEP"
		);

		// Run validation with the fetched questions data
		const validationErrors = validateFormResponses(validatableQuestions, answers);

		// If there are validation errors, return them immediately
		if (validationErrors.length > 0) {
			return res.status(400).json({
				error: "Form validation failed",
				validationErrors: validationErrors,
			});
		}

		// If validation passes, proceed with service call
		const response = await submitFormResponseService(formId, answers);
		res.status(201).json({
			data: response,
			message: "Form response submitted successfully",
		});
	} catch (error: any) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};