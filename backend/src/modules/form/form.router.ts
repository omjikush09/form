import express, { Router } from "express";
import {
	createForm,
	getFormsByUser,
	getFormById,
	updateForm,
	deleteForm,
	getFormQuestions,
	publishFormWithQuestions,
	submitFormResponse,
} from "./form.controller.js";
import { validateRequest } from "../../util/validation.js";
import { FormValidationSchemas } from "./form.schema.js";
import { validateFormAnswers } from "./form.middleware.js";

const router: Router = express.Router();

// Create form
router.post("/", validateRequest(FormValidationSchemas.createForm), createForm);

// Get forms by user
router.get("/user/:userId", validateRequest(FormValidationSchemas.getFormsByUser), getFormsByUser);

// Get form by ID
router.get("/:formId", validateRequest(FormValidationSchemas.getFormById), getFormById);

// Update form
router.put("/:formId", validateRequest(FormValidationSchemas.updateForm), updateForm);

// Delete form
router.delete("/:formId", validateRequest(FormValidationSchemas.deleteForm), deleteForm);

// Get form questions
router.get("/:formId/questions", validateRequest(FormValidationSchemas.getFormQuestions), getFormQuestions);

// Publish form with questions
router.post("/:formId/publish-with-questions", validateRequest(FormValidationSchemas.publishFormWithQuestions), publishFormWithQuestions);

// Submit form response (using both validation middlewares)
router.post("/:formId/responses", validateRequest(FormValidationSchemas.submitFormResponse), validateFormAnswers, submitFormResponse);

export default router;
