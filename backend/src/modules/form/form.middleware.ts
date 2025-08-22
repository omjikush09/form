import type { Request, Response, NextFunction } from "express";
import { validateFormResponses } from "./form.validations.js";
import { getFormQuestionsService } from "./form.service.js";

// Middleware to validate form submission answers
export const validateFormAnswers = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Get form ID from request params
		const formId = req.params.formId;
		if (!formId) {
			res.status(400).json({
				error: "Form ID is required",
			});
			return;
		}

		const { answers } = req.body;

		// Fetch form questions from the database
		const formQuestions = await getFormQuestionsService(formId);

		if (formQuestions.length === 0) {
			res.status(404).json({
				error: "Form not found or has no questions",
			});
			return;
		}

		// Filter out questions for validation
		const validatableQuestions = formQuestions.filter(
			(question) =>
				question.type !== "START_STEP" &&
				question.type !== "END_STEP" &&
				question.type != "STATEMENT"
		);

		// Run validation with the filtered questions data
		const validationErrors = validateFormResponses(
			validatableQuestions,
			answers
		);

		if (validationErrors.length > 0) {
			res.status(400).json({
				error: "Form validation failed",
				validationErrors: validationErrors,
			});
			return;
		}

		next();
	} catch (error) {
		console.error("Error in validateFormAnswers middleware:", error);
		res.status(500).json({
			error: "Internal server error during validation",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
