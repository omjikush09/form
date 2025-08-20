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
		} else if (questionData.type === "MULTI_SELECT_OPTION") {
			const selectedOptions = answer.answer || [];
			const selectionType = questionData.data?.selectionType || "unlimited";
			const minSelections = questionData.data?.minSelections || 0;
			const maxSelections = questionData.data?.maxSelections || null;
			const fixedSelections = questionData.data?.fixedSelections || null;

			// Validate based on selection type
			if (selectionType === "fixed" && fixedSelections) {
				if (selectedOptions.length !== fixedSelections) {
					errors.push({
						field: "general",
						message: `Please select exactly ${fixedSelections} option(s). Currently ${selectedOptions.length} selected.`,
					});
				}
			} else if (selectionType === "range") {
				if (selectedOptions.length < minSelections) {
					errors.push({
						field: "general",
						message: `Please select at least ${minSelections} option(s). Currently ${selectedOptions.length} selected.`,
					});
				}
				if (maxSelections && selectedOptions.length > maxSelections) {
					errors.push({
						field: "general",
						message: `Please select no more than ${maxSelections} option(s). Currently ${selectedOptions.length} selected.`,
					});
				}
			}

			// Check required field (for any selection type)
			if (questionData.required && selectedOptions.length === 0) {
				errors.push({
					field: "general",
					message: "Please select at least one option",
				});
			}
		} else if (questionData.type === "NUMBER") {
			const value = answer.answer;
			const numValue = parseFloat(value);
			const minValue = questionData.data?.minValue;
			const maxValue = questionData.data?.maxValue;

			// Check if value is provided when required
			if (questionData.required && (!value || value.trim() === "")) {
				errors.push({
					field: "general",
					message: "This field is required",
				});
			}

			// Validate numeric input and range if value is provided
			if (value && value.trim() !== "") {
				// Check if it's a valid number
				if (isNaN(numValue)) {
					errors.push({
						field: "general",
						message: "Please enter a valid number",
					});
				} else {
					// Check minimum value
					if (minValue !== undefined && numValue < minValue) {
						errors.push({
							field: "general",
							message: `Value must be at least ${minValue}`,
						});
					}

					// Check maximum value
					if (maxValue !== undefined && numValue > maxValue) {
						errors.push({
							field: "general",
							message: `Value must be no more than ${maxValue}`,
						});
					}
				}
			}
		} else if (questionData.type === "LONG_TEXT") {
			const value = answer.answer;
			const minLength = questionData.data?.minLength;
			const maxLength = questionData.data?.maxLength;

			// Check if value is provided when required
			if (questionData.required && (!value || value.trim() === "")) {
				errors.push({
					field: "general",
					message: "This field is required",
				});
			}

			// Validate length constraints if value is provided
			if (value && value.trim() !== "") {
				const textLength = value.length;

				// Check minimum length
				if (minLength !== undefined && textLength < minLength) {
					errors.push({
						field: "general",
						message: `Text must be at least ${minLength} characters long. Currently ${textLength} characters.`,
					});
				}

				// Check maximum length
				if (maxLength !== undefined && textLength > maxLength) {
					errors.push({
						field: "general",
						message: `Text must be no more than ${maxLength} characters long. Currently ${textLength} characters.`,
					});
				}
			}
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
