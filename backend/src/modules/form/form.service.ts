import { InsertQueryBuilder, sql } from "kysely";
import { db } from "../../db/index.js";
import type { DB, Form } from "../../generated/prisma/types.js";

export const createFormService = async (
	userId: string,
	title: string,
	settings: any = {}
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

		trx
			.insertInto("Form_Questions")
			.values({
				form_id: form.id,
				title: "Hey there 😀",
				description: "Mind filling out this form?",
				step: 0,
				type: "START_STEP",
				data: JSON.stringify({}),
				buttonText: "Get Started",
				updatedAt: sql`NOW()`,
			})
			.executeTakeFirstOrThrow();
		trx
			.insertInto("Form_Questions")
			.values({
				form_id: form.id,
				title: "Thank you! 🙌",
				description: "That's all. You may now close this window.",
				step: 1,
				type: "END_STEP",
				data: JSON.stringify({}),
				updatedAt: sql`NOW()`,
			})
			.executeTakeFirstOrThrow();
		return form;
	});

	// const form =

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
	updates: { title?: string; settings?: any; status?: string }
) => {
	const updateData: any = {};

	if (updates.title) updateData.title = updates.title;
	if (updates.settings) updateData.settings = JSON.stringify(updates.settings);
	if (updates.status) updateData.status = updates.status;

	const form = await db
		.updateTable("Form")
		.set(updateData)
		.where("id", "=", formId)
		.returningAll()
		.executeTakeFirstOrThrow();

	return form;
};

export const deleteFormService = async (formId: string) => {
	await db.deleteFrom("Form").where("id", "=", formId).execute();
};

export const publishFormService = async (formId: string) => {
	const form = await db
		.updateTable("Form")
		.set({
			status: "PUBLISHED",
			publishedAt: new Date(),
		})
		.where("id", "=", formId)
		.returningAll()
		.executeTakeFirstOrThrow();

	return form;
};

export const addQuestionToFormService = async (
	formId: string,
	question: {
		type: string;
		title: string;
		description: any;
		data: any;
		step?: number;
		required?: boolean;
	}
) => {
	const formQuestion = await db
		.insertInto("Form_Questions")
		.values({
			form_id: formId,
			type: question.type as any,
			title: question.title,
			description: JSON.stringify(question.description),
			data: JSON.stringify(question.data),
			step: question.step || 0,
			required: question.required || false,
			updatedAt: sql`NOW()`,
		})
		.returningAll()
		.executeTakeFirstOrThrow();
	console.log(formQuestion);

	return formQuestion;
};

export const getFormQuestionsService = async (formId: string) => {
	const questions = await db
		.selectFrom("Form_Questions")
		.selectAll()
		.where("form_id", "=", formId)
		.orderBy("step", "asc")
		.execute();

	return questions;
};

export const upsertFormQuestionsService = async (
	formId: string,
	questions: Array<{
		id?: string;
		type: string;
		title: string;
		description: string;
		data: any;
		step: number;
		required?: boolean;
		buttonText?: string;
	}>
) => {
	return await db.transaction().execute(async (trx) => {
		const questionsToUpdate = questions.filter((q) => q.id);
		const questionsToCreate = questions.filter((q) => !q.id);

		const results = [];

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
			results.push(...updateResults.flat());
		}

		if (questionsToCreate.length > 0) {
			const createResults = await trx
				.insertInto("Form_Questions")
				.values(
					questionsToCreate.map((question) => ({
						form_id: formId,
						type: question.type as any,
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

			results.push(...createResults);
		}

		return results;
	});
};

export const publishFormWithQuestionsService = async (
	formId: string,
	questions?: Array<{
		id?: string;
		type: string;
		title: string;
		description: string;
		data: any;
		step: number;
		required?: boolean;
		buttonText?: string;
	}>
) => {
	// console.log(questions);
	return await db.transaction().execute(async (trx) => {
		let questionResults = [];

		if (questions && questions.length > 0) {
			// Get all existing questions for the form
			const existingQuestions = await trx
				.selectFrom("Form_Questions")
				.select(["id"])
				.where("form_id", "=", formId)
				.execute();

			// Get IDs from frontend questions that have IDs
			const frontendQuestionIds = questions
				.filter((q) => q.id)
				.map((q) => q.id!);

			// Find questions to delete (exist in database but not in frontend)
			const questionsToDelete = existingQuestions.filter(
				(dbQuestion) => !frontendQuestionIds.includes(dbQuestion.id)
			);

			// Delete questions that are no longer needed
			if (questionsToDelete.length > 0) {
				await trx
					.deleteFrom("Form_Questions")
					.where("form_id", "=", formId)
					.where("id", "in", questionsToDelete.map((q) => q.id))
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
							type: question.type as any,
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
	answers: Array<{
		form_question_id: string;
		answer: any;
	}>
) => {
	return await db.transaction().execute(async (trx) => {
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

			await trx
				.insertInto("Form_Answers")
				.values(answerValues)
				.execute();
		}

		return formResponse;
	});
};
