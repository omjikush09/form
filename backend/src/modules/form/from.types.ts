import type { CreateRequestType } from "../../util/validation.js";
import type { FormValidationSchemas } from "./form.schema.js";

// Type definitions for form requests
export type CreateFormRequest = CreateRequestType<
	typeof FormValidationSchemas.createForm
>;
export type GetFormsByUserRequest = CreateRequestType<
	typeof FormValidationSchemas.getFormsByUser
>;
export type GetFormByIdRequest = CreateRequestType<
	typeof FormValidationSchemas.getFormById
>;
export type UpdateFormRequest = CreateRequestType<
	typeof FormValidationSchemas.updateForm
>;
export type DeleteFormRequest = CreateRequestType<
	typeof FormValidationSchemas.deleteForm
>;
export type GetFormQuestionsRequest = CreateRequestType<
	typeof FormValidationSchemas.getFormQuestions
>;
export type PublishFormWithQuestionsRequest = CreateRequestType<
	typeof FormValidationSchemas.publishFormWithQuestions
>;
export type SubmitFormResponseRequest = CreateRequestType<
	typeof FormValidationSchemas.submitFormResponse
>;
