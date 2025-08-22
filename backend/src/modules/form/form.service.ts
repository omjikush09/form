import { sql } from "kysely";
import { db } from "../../db/index.js";
import { z } from "zod";
import type {
	FormSettingsSchema,
	PublishFormBodySchema,
	SubmitFormResponseBodySchema,
	UpdateFormBodySchema,
} from "./form.schema.js";
export const createFormService = async (
	userId: string,
	title: string,
	settings: z.infer<typeof FormSettingsSchema>,
	questions?: z.infer<typeof PublishFormBodySchema>["questions"]
) => {
	const form = db.transaction().execute(async (trx) => {
		const form = await trx
			.insertInto("Form")
			.values({
				userId,
				title,
				settings: JSON.stringify(settings),
				updatedAt: sql`NOW()`,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		if (questions && questions.length > 0) {
			// Create custom questions if provided
			await trx
				.insertInto("Form_Questions")
				.values(
					questions.map((question) => ({
						form_id: form.id,
						type: question.type,
						title: question.title,
						description: question.description,
						data: JSON.stringify(question.data),
						step: question.step,
						required: question.required || false,
						buttonText: question.buttonText,
						updatedAt: sql`NOW()`,
					}))
				)
				.execute();
		}

		return form;
	});

	return form;
};

export const getFormsByUserService = async (userId: string) => {
	const forms = await db
		.selectFrom("Form")
		.selectAll()
		.where("userId", "=", userId)
		.orderBy("createdAt", "desc")
		.execute();

	return forms;
};

export const getFormByIdService = async (formId: string) => {
	const form = await db
		.selectFrom("Form")
		.selectAll()
		.where("id", "=", formId)
		.executeTakeFirst();

	return form;
};

export const updateFormService = async (
	formId: string,
	updates: z.infer<typeof UpdateFormBodySchema>
) => {
	const form = await db
		.updateTable("Form")
		.set(updates)
		.where("id", "=", formId)
		.returningAll()
		.executeTakeFirstOrThrow();

	return form;
};

export const deleteFormService = async (formId: string) => {
	await db.deleteFrom("Form").where("id", "=", formId).execute();
};

export const getFormQuestionsService = async (formId: string) => {
	const questions = await db
		.selectFrom("Form_Questions")
		.selectAll()
		.where("form_id", "=", formId)
		.where("deleted", "=", false)
		.orderBy("step", "asc")
		.execute();

	return questions;
};

export const publishFormWithQuestionsService = async (
	formId: string,
	questions: z.infer<typeof PublishFormBodySchema>["questions"]
) => {
	return await db.transaction().execute(async (trx) => {
		let questionResults = [];

		if (questions && questions.length > 0) {
			// Get all existing non-deleted questions for the form
			const existingQuestions = await trx
				.selectFrom("Form_Questions")
				.select(["id"])
				.where("form_id", "=", formId)
				.where("deleted", "=", false)
				.execute();

			// Get IDs from frontend questions that have IDs
			const frontendQuestionIds = questions
				.filter((q) => q.id)
				.map((q) => q.id!);

			// Find questions to mark as deleted (exist in database but not in frontend)
			const questionsToDelete = existingQuestions.filter(
				(dbQuestion) => !frontendQuestionIds.includes(dbQuestion.id)
			);

			// Mark questions as deleted instead of hard deleting them
			if (questionsToDelete.length > 0) {
				await trx
					.updateTable("Form_Questions")
					.set({
						deleted: true,
						updatedAt: sql`NOW()`,
					})
					.where("form_id", "=", formId)
					.where(
						"id",
						"in",
						questionsToDelete.map((q) => q.id)
					)
					.execute();
			}

			const questionsToUpdate = questions.filter((q) => q.id);
			const questionsToCreate = questions.filter((q) => !q.id);

			if (questionsToUpdate.length > 0) {
				const updatePromises = questionsToUpdate.map((question) =>
					trx
						.updateTable("Form_Questions")
						.set({
							title: question.title,
							description: question.description,
							data: JSON.stringify(question.data),
							step: question.step,
							required: question.required || false,
							buttonText: question.buttonText,
							updatedAt: sql`NOW()`,
						})
						.where("id", "=", question.id!)
						.where("form_id", "=", formId)
						.returningAll()
						.execute()
				);

				const updateResults = await Promise.all(updatePromises);
				questionResults.push(...updateResults.flat());
			}

			if (questionsToCreate.length > 0) {
				const createResults = await trx
					.insertInto("Form_Questions")
					.values(
						questionsToCreate.map((question) => ({
							form_id: formId,
							type: question.type,
							title: question.title,
							description: question.description,
							data: JSON.stringify(question.data),
							step: question.step,
							required: question.required || false,
							buttonText: question.buttonText,
							updatedAt: sql`NOW()`,
						}))
					)
					.returningAll()
					.execute();

				questionResults.push(...createResults);
			}
		}

		const form = await trx
			.updateTable("Form")
			.set({
				status: "PUBLISHED",
				publishedAt: sql`NOW()`,
			})
			.where("id", "=", formId)
			.returningAll()
			.executeTakeFirstOrThrow();

		return { form, questions: questionResults };
	});
};

export const submitFormResponseService = async (
	formId: string,
	answers: z.infer<typeof SubmitFormResponseBodySchema>["answers"]
) => {
	return await db.transaction().execute(async (trx) => {
		// Create the form response
		const formResponse = await trx
			.insertInto("Form_Response")
			.values({
				form_id: formId,
				updatedAt: sql`NOW()`,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		if (answers.length > 0) {
			const answerValues = answers.map((answer) => ({
				form_response_id: formResponse.id,
				form_question_id: answer.form_question_id,
				answer: JSON.stringify(answer.answer),
			}));

			await trx.insertInto("Form_Answers").values(answerValues).execute();
		}

		return formResponse;
	});
};
