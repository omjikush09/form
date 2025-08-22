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
import type {
	CreateFormRequest,
	DeleteFormRequest,
	GetFormByIdRequest,
	GetFormQuestionsRequest,
	GetFormsByUserRequest,
	PublishFormWithQuestionsRequest,
	SubmitFormResponseRequest,
	UpdateFormRequest,
} from "./from.types.js";
import { validateFormResponses } from "./form.validations.js";

export const createForm = async (
	req: Request<CreateFormRequest["params"], unknown, CreateFormRequest["body"]>,
	res: Response
) => {
	try {
		const { userId, title, settings } = req.body;

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

export const getFormsByUser = async (
	req: Request<
		GetFormsByUserRequest["params"],
		unknown,
		GetFormsByUserRequest["body"]
	>,
	res: Response
) => {
	try {
		const { userId } = req.params;
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

export const getFormById = async (
	req: Request<
		GetFormByIdRequest["params"],
		unknown,
		GetFormByIdRequest["body"]
	>,
	res: Response
) => {
	try {
		const { formId } = req.params;
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

export const updateForm = async (
	req: Request<UpdateFormRequest["params"], unknown, UpdateFormRequest["body"]>,
	res: Response
) => {
	try {
		const { formId } = req.params;
		const updates = req.body;

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

export const deleteForm = async (
	req: Request<DeleteFormRequest["params"], unknown, DeleteFormRequest["body"]>,
	res: Response
) => {
	try {
		const { formId } = req.params;
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

export const getFormQuestions = async (
	req: Request<
		GetFormQuestionsRequest["params"],
		unknown,
		GetFormQuestionsRequest["body"]
	>,
	res: Response
) => {
	try {
		const { formId } = req.params;
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

export const publishFormWithQuestions = async (
	req: Request<
		PublishFormWithQuestionsRequest["params"],
		unknown,
		PublishFormWithQuestionsRequest["body"]
	>,
	res: Response
) => {
	try {
		const { formId } = req.params;
		const { questions } = req.body;

		// Transform questions to match service expectations
		const serviceQuestions = questions.map((q) => ({
			...(q.id !== undefined && { id: q.id }),
			type: q.type,
			title: q.title || "",
			description: q.description || "",
			data: q.data,
			step: q.step,
			...(q.required !== undefined && { required: q.required }),
			...(q.buttonText !== undefined &&
				q.buttonText !== null && { buttonText: q.buttonText }),
		}));

		const result = await publishFormWithQuestionsService(
			formId,
			serviceQuestions
		);
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

export const submitFormResponse = async (
	req: Request<
		SubmitFormResponseRequest["params"],
		unknown,
		SubmitFormResponseRequest["body"]
	>,
	res: Response
) => {
	try {
		const { formId } = req.params;
		const { answers } = req.body;

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
