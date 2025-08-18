import express, { Router } from "express";
import {
	createFormService,
	getFormsByUserService,
	getFormByIdService,
	updateFormService,
	deleteFormService,
	publishFormService,
	addQuestionToFormService,
	getFormQuestionsService,
	upsertFormQuestionsService,
	publishFormWithQuestionsService,
	submitFormResponseService,
} from "./form.service.js";

const router: Router = express.Router();

router.post("/", async (req, res) => {
	try {
		const { userId, title, settings } = req.body;

		if (!userId || !title) {
			return res.status(400).json({
				error: "userId and title are required",
			});
		}

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
});

router.get("/user/:userId", async (req, res) => {
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
});

router.get("/:formId", async (req, res) => {
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
});

router.put("/:formId", async (req, res) => {
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
});

router.delete("/:formId", async (req, res) => {
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
});

router.post("/:formId/publish", async (req, res) => {
	try {
		const { formId } = req.params;
		const form = await publishFormService(formId);
		res.json({
			data: form,
			message: "Form published successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
});

router.post("/:formId/questions", async (req, res) => {
	console.log("ROUter is hitting");
	try {
		const { formId } = req.params;
		const question = req.body;

		const formQuestion = await addQuestionToFormService(formId, question);
		res.status(201).json({
			data: formQuestion,
			message: "Question added successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
});

router.get("/:formId/questions", async (req, res) => {
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
});

router.put("/:formId/questions", async (req, res) => {
	try {
		const { formId } = req.params;
		const { questions } = req.body;

		if (!questions || !Array.isArray(questions)) {
			return res.status(400).json({
				error: "Questions array is required",
			});
		}

		const results = await upsertFormQuestionsService(formId, questions);
		res.json({
			data: results,
			message: "Questions updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
});

router.post("/:formId/publish-with-questions", async (req, res) => {
	try {
		const { formId } = req.params;
		const { questions } = req.body;
		console.log(req.body);
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
});

router.post("/:formId/responses", async (req, res) => {
	try {
		const { formId } = req.params;
		const { answers } = req.body;
		
		if (!answers || !Array.isArray(answers)) {
			return res.status(400).json({
				error: "Answers array is required",
			});
		}
		
		const response = await submitFormResponseService(formId, answers);
		res.status(201).json({
			data: response,
			message: "Form response submitted successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
});

export default router;
