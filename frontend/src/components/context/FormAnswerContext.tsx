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

type ValidationError = {
	field: string;
	message: string;
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
	validateQuestion: (
		questionId: string,
		questionData: any
	) => ValidationError[];
	canProceedToNext: (questionId: string, questionData: any) => boolean;
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
			if ((questionType == "CONTACT_INFO" || questionType == "ADDRESS") && id != undefined) {
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

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePhone = (phone: string): boolean => {
		const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
		return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
	};

	const validateQuestion = (
		questionId: string,
		questionData: any
	): ValidationError[] => {
		const errors: ValidationError[] = [];
		const answer = getAnswer(questionId);

		if (!answer) {
			if (questionData.required) {
				errors.push({ field: "general", message: "This field is required" });
			}
			return errors;
		}

		if (questionData.type === "CONTACT_INFO" || questionData.type === "ADDRESS") {
			const contactAnswer = answer.answer;
			const fields = questionData.data?.fields || [];

			fields.forEach((field: any) => {
				const value = contactAnswer?.[field.id]?.value || "";

				if (field.required && (!value || value.trim() === "")) {
					errors.push({
						field: field.id,
						message: `${field.title} is required`,
					});
				}

				if (value && field.type === "email" && !validateEmail(value)) {
					errors.push({
						field: field.id,
						message: "Please enter a valid email address",
					});
				}

				if (value && field.type === "tel" && !validatePhone(value)) {
					errors.push({
						field: field.id,
						message: "Please enter a valid phone number",
					});
				}
			});
		} else {
			const value = answer.answer;

			if (questionData.required && (!value || value.trim() === "")) {
				errors.push({
					field: "general",
					message: "This field is required",
				});
			}
		}

		return errors;
	};

	const canProceedToNext = (questionId: string, questionData: any): boolean => {
		const errors = validateQuestion(questionId, questionData);
		return errors.length === 0;
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
				toast.error("Failed to submit form");
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
				validateQuestion,
				canProceedToNext,
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
