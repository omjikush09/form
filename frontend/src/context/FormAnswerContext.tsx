"use client";

import { AddElementFromType } from "@/config/data";
import api from "@/util/axios";
import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState,
} from "react";
import { toast } from "sonner";

export type FormAnswer = {
	questionId: string;
	answer: any;
};

type FormAnswerContextType = {
	answers: FormAnswer[];
	setAnswer: (
		questionId: string,
		questionType: AddElementFromType,
		answer: any,
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

export default function FormAnswerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [answers, setAnswers] = useState<FormAnswer[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const setAnswer = (
		questionId: string,
		questionType: AddElementFromType,
		answer: any,
		id?: string
	) => {
		setAnswers((prev) => {
			const existingIndex = prev.findIndex((a) => a.questionId === questionId);
			const newAnswer: FormAnswer = {
				questionId,
				answer,
			};
			if (
				(questionType == "CONTACT_INFO" || questionType == "ADDRESS") &&
				id != undefined
			) {
				const updated = [...prev];
				updated[existingIndex].answer[id].value = answer;
				return updated;
			}

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
				if (response.data.error && response.data.validationErrors) {
					response.data.validationsErros.forEach((err: any) => {
						toast.error(err.field, err.message);
					});
				} else {
					toast.error("Failed to submit form");
				}
				return false;
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error("Failed to submit form");
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