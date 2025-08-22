"use client";

import { AddElementFromType, inputValues } from "@/config/data";
import api from "@/util/axios";
import { AxiosError } from "axios";
import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState,
} from "react";
import { toast } from "sonner";

// Define specific answer types for each form element type
type ShortTextAnswer = string;
type LongTextAnswer = string;
type NumberAnswer = string;
type DateAnswer = string;
type URLAnswer = string;
type StatementAnswer = never; // Statement doesn't have answers
type SingleSelectAnswer = string;
type MultiSelectAnswer = string[];
type DropdownAnswer = string;
type ContactInfoAnswer = Record<
	string,
	{ title: string; value: string; type: inputValues }
>;
type AddressAnswer = Record<
	string,
	{ title: string; value: string; type: inputValues }
>;

// Map each form element type to its answer type
type AnswerType = {
	SHORT_TEXT: ShortTextAnswer;
	LONG_TEXT: LongTextAnswer;
	NUMBER: NumberAnswer;
	DATE: DateAnswer;
	URL: URLAnswer;
	STATEMENT: StatementAnswer;
	SINGLE_SELECT_OPTION: SingleSelectAnswer;
	MULTI_SELECT_OPTION: MultiSelectAnswer;
	DROPDOWN: DropdownAnswer;
	CONTACT_INFO: ContactInfoAnswer;
	ADDRESS: AddressAnswer;
};

export type FormAnswer<T extends AddElementFromType = AddElementFromType> = {
	questionId: string;
	questionType: T;
	answer: AnswerType[T];
};

type FormAnswerContextType = {
	answers: FormAnswer[];
	setAnswer: <T extends AddElementFromType>(
		questionId: string,
		questionType: T,
		answer: T extends "CONTACT_INFO" | "ADDRESS"
			? AnswerType[T] | string
			: AnswerType[T],
		id?: string
	) => void;
	getAnswer: (questionId: string) => FormAnswer | undefined;
	clearAnswers: () => void;
	submitAnswers: (formId: string) => Promise<boolean>;
	setAnswers: Dispatch<SetStateAction<FormAnswer[]>>;
	isSubmitting: boolean;
};

const FormAnswerContext = createContext<FormAnswerContextType | null>(null);

export const useFormAnswers = () => {
	const context = useContext(FormAnswerContext);
	if (!context) {
		throw new Error("useFormAnswers must be used within FormAnswerProvider");
	}
	return context;
};

// Generic hook for type-safe answer retrieval
export const getAnswerFromQuesitonId = <T extends AddElementFromType>(
	questionId: string,
	questionType: T
): AnswerType[T] | undefined => {
	const { answers } = useFormAnswers();
	const answer = answers.find((a) => a.questionId === questionId);
	if (answer?.questionType === questionType) {
		return answer.answer as AnswerType[T];
	}
	return undefined;
};

export default function FormAnswerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [answers, setAnswers] = useState<FormAnswer[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const setAnswer = <T extends AddElementFromType>(
		questionId: string,
		questionType: T,
		answer: T extends "CONTACT_INFO" | "ADDRESS"
			? AnswerType[T] | string
			: AnswerType[T],
		id?: string
	) => {
		setAnswers((prev) => {
			const existingIndex = prev.findIndex((a) => a.questionId === questionId);

			// Handle field updates for CONTACT_INFO and ADDRESS
			if (
				(questionType === "CONTACT_INFO" || questionType === "ADDRESS") &&
				id !== undefined
			) {
				const updated = [...prev];
				if (existingIndex >= 0) {
					const existingAnswer = updated[existingIndex];
					if (
						existingAnswer.questionType === "CONTACT_INFO" ||
						existingAnswer.questionType === "ADDRESS"
					) {
						const answerRecord = existingAnswer.answer as Record<
							string,
							{ title: string; value: string }
						>;
						if (answerRecord[id]) {
							answerRecord[id].value = answer as string;
						}
					}
				}
				return updated;
			}

			// Handle normal answer updates
			const newAnswer: FormAnswer<T> = {
				questionId,
				questionType,
				answer: answer as AnswerType[T],
			};

			if (existingIndex >= 0) {
				const updated = [...prev];
				updated[existingIndex] = newAnswer;
				return updated;
			} else {
				return [...prev, newAnswer];
			}
		});
	};

	const getAnswer = (questionId: string): FormAnswer | undefined => {
		return answers.find((a) => a.questionId === questionId);
	};

	const clearAnswers = () => {
		setAnswers([]);
	};

	const submitAnswers = async (formId: string): Promise<boolean> => {
		if (answers.length === 0) {
			toast.error("No answers to submit");
			return false;
		}

		setIsSubmitting(true);
		try {
			const formattedAnswers = answers.map((answer) => ({
				form_question_id: answer.questionId,
				answer: answer.answer,
			}));

			const response = await api.post(`/form/${formId}/responses`, {
				answers: formattedAnswers,
			});

			if (response.status === 201) {
				toast.success("Form submitted successfully!");
				clearAnswers();
				return true;
			} else {
				return false;
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				const response = error.response!;

				if (response.data.error && response.data.validationErrors) {
					response.data.validationErrors.forEach((err: any) => {
						toast.error(err.field, err.message);
					});
				} else {
					toast.error("Failed to submit form");
				}
			} else {
				toast.error("Failed to submit form");
			}

			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<FormAnswerContext.Provider
			value={{
				answers,
				setAnswer,
				getAnswer,
				clearAnswers,
				submitAnswers,
				isSubmitting,
				setAnswers,
			}}
		>
			{children}
		</FormAnswerContext.Provider>
	);
}
