"use client";
import {
	FormDefaultData,
	FormElementTypes,
	AddElementFromType,
} from "@/config/data";
import api from "@/util/axios";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";

export type FormElementConfig = (typeof FormDefaultData)[FormElementTypes];

type ElementContextType = {
	formStepData: FormElementConfig[];
	loading: boolean;
	error: string | null;
	addElements: (formId: string, type: AddElementFromType) => void;
	setElements: (formId: string) => void;
	changeQuestionProperty: (
		step: number,
		property: string,
		value: string | boolean | {}
	) => void;
	changeFieldProperty: (
		step: number,
		fieldId: string,
		property: string,
		value: string | boolean
	) => void;
	removeStep: (step: number) => void;
	reorderSteps: (activeStep: number, overStep: number) => void;
	addOption: (
		step: number,
		option: { id: string; label: string; value: string }
	) => void;
	updateOption: (
		step: number,
		optionId: string,
		property: string,
		value: string | boolean
	) => void;
	removeOption: (step: number, optionId: string) => void;
	reorderOptions: (step: number, activeId: string, overId: string) => void;
	publishForm: (formId: string) => void;
};

export const FormStepContext = createContext<ElementContextType | null>(null);

export default function ElementContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [formStepData, setFormData] = useState<FormElementConfig[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const addElements = (formId: string, type: AddElementFromType) => {
		// body[step] = 2;
		const exceptEnd = formStepData.filter((data) => data.type != "END_STEP");
		let endStep = formStepData.find((data) => data.type == "END_STEP")!;
		let body: FormElementConfig = {
			...FormDefaultData[type],
			step: endStep?.step,
		};
		endStep.step = endStep?.step + 1;
		setFormData([...exceptEnd, body, endStep]);

	};

	const setElements = async (formId: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await api.get(`/form/${formId}/questions`);
			setFormData(data.data.data);
		} catch (error) {
			setError("Failed to load form steps");
			toast("Failed to load form data");
		} finally {
			setLoading(false);
		}
	};

	const changeQuestionProperty = (
		step: number,
		property: string,
		value: string | boolean | {}
	) => {
		setFormData((prev) => {
			const updated = [...prev];
			const questionIndex = updated.findIndex((q) => q.step === step);

			if (questionIndex >= 0) {
				updated[questionIndex] = {
					...updated[questionIndex],
					[property]: value,
				};
			}

			return updated;
		});
	};

	const changeFieldProperty = (
		step: number,
		fieldId: string,
		property: string,
		value: string | boolean
	) => {
		setFormData((prev) => {
			const updated = [...prev];
			const questionIndex = updated.findIndex((q) => q.step === step);

			if (questionIndex >= 0) {
				const question = updated[questionIndex];

				if (
					(question.type === "CONTACT_INFO" || question.type === "ADDRESS") &&
					question.data &&
					"fields" in question.data
				) {
					const updatedFields = question.data.fields.map((field) =>
						field.id === fieldId ? { ...field, [property]: value } : field
					);

					updated[questionIndex] = {
						...question,
						data: {
							...question.data,
							fields: updatedFields,
						},
					};
				}
			}

			return updated;
		});
	};

	const removeStep = (step: number) => {
		// Validation: Cannot remove first step (step 0) or last step (END_STEP)
		const sortedSteps = formStepData.sort((a, b) => a.step - b.step);
		const firstStep = sortedSteps[0];
		const lastStep = sortedSteps[sortedSteps.length - 1];

		// Prevent removal of first step
		if (step === firstStep?.step) {
			toast.error("Cannot remove the first step");
			return;
		}

		// Prevent removal of last step (END_STEP)
		if (
			step === lastStep?.step ||
			formStepData.find((s) => s.step === step)?.type === "END_STEP"
		) {
			toast.error("Cannot remove the last step");
			return;
		}

		setFormData((prev) => {
			// Remove the step
			const withoutRemovedStep = prev.filter((s) => s.step !== step);

			// Decrement step numbers for all steps that come after the removed step
			const updatedSteps = withoutRemovedStep.map((s) => {
				if (s.step > step) {
					return {
						...s,
						step: s.step - 1,
					};
				}
				return s;
			});

			return updatedSteps;
		});

		toast("Step removed successfully");
	};

	const reorderSteps = (activeStep: number, overStep: number) => {
		if (activeStep === overStep) return;

		setFormData((prev) => {
			const activeStepData = prev.find((s) => s.step === activeStep);
			const overStepData = prev.find((s) => s.step === overStep);

			if (!activeStepData || !overStepData) return prev;

			// Don't allow reordering START_STEP or END_STEP
			if (
				activeStepData.type === "START_STEP" ||
				activeStepData.type === "END_STEP" ||
				overStepData.type === "START_STEP" ||
				overStepData.type === "END_STEP"
			) {
				toast.error("Cannot reorder START or END steps");
				return prev;
			}

			// Sort current steps to get proper order
			const sortedSteps = [...prev].sort((a, b) => a.step - b.step);

			// Find indices in sorted array
			const activeIndex = sortedSteps.findIndex((s) => s.step === activeStep);
			const overIndex = sortedSteps.findIndex((s) => s.step === overStep);

			// Create new array with reordered items
			const reorderedSteps = [...sortedSteps];
			const [movedStep] = reorderedSteps.splice(activeIndex, 1);
			reorderedSteps.splice(overIndex, 0, movedStep);

			// Reassign step numbers to maintain proper sequence
			const updatedSteps = reorderedSteps.map((step, index) => ({
				...step,
				step: index,
			}));

			return updatedSteps;
		});
		toast("Steps reordered successfully");
	};

	const addOption = (
		step: number,
		option: { id: string; label: string; value: string }
	) => {
		setFormData((prev) => {
			const updated = [...prev];
			const questionIndex = updated.findIndex((q) => q.step === step);

			if (questionIndex >= 0) {
				const question = updated[questionIndex];
				if (
					question.type === "SINGLE_SELECT_OPTION" ||
					question.type === "MULTI_SELECT_OPTION" ||
					question.type === "DROPDOWN"
				) {
					updated[questionIndex] = {
						...question,
						data: {
							...question.data,
							options: [...question.data.options, option],
						},
					} as FormElementConfig; // Else we have to separed single and multi select due to TS
				}
			}

			return updated;
		});
	};

	const updateOption = (
		step: number,
		optionId: string,
		property: string,
		value: string | boolean
	) => {
		setFormData((prev) => {
			const updated = [...prev];
			const questionIndex = updated.findIndex((q) => q.step === step);

			if (questionIndex >= 0) {
				const question = updated[questionIndex];
				if (
					question.type === "SINGLE_SELECT_OPTION" ||
					question.type === "MULTI_SELECT_OPTION" ||
					question.type === "DROPDOWN"
				) {
					const updatedOptions = question.data.options.map((option) =>
						option.id === optionId ? { ...option, [property]: value } : option
					);

					updated[questionIndex] = {
						...question,
						data: {
							...question.data,
							options: updatedOptions,
						},
					} as FormElementConfig; // Else we have to separed single and multi select due to TS
				}
			}

			return updated;
		});
	};

	const removeOption = (step: number, optionId: string) => {
		setFormData((prev) => {
			const updated = [...prev];
			const questionIndex = updated.findIndex((q) => q.step === step);

			if (questionIndex >= 0) {
				const question = updated[questionIndex];
				if (
					question.type === "SINGLE_SELECT_OPTION" ||
					question.type === "MULTI_SELECT_OPTION" ||
					question.type === "DROPDOWN"
				) {
					const updatedOptions = question.data.options.filter(
						(option) => option.id !== optionId
					);

					updated[questionIndex] = {
						...question,
						data: {
							...question.data,
							options: updatedOptions,
						},
					} as FormElementConfig; // Else we have to separed single and multi select due to TS
				}
			}

			return updated;
		});
		toast("Option removed successfully");
	};

	const reorderOptions = (step: number, activeId: string, overId: string) => {
		if (activeId === overId) return;

		setFormData((prev) => {
			const updated = [...prev];
			const questionIndex = updated.findIndex((q) => q.step === step);

			if (questionIndex >= 0) {
				const question = updated[questionIndex];
				if (
					(question.type === "SINGLE_SELECT_OPTION" ||
						question.type === "MULTI_SELECT_OPTION" ||
						question.type === "DROPDOWN") &&
					question.data &&
					"options" in question.data
				) {
					const options = [...question.data.options];
					const activeIndex = options.findIndex(
						(option) => option.id === activeId
					);
					const overIndex = options.findIndex((option) => option.id === overId);

					if (activeIndex !== -1 && overIndex !== -1) {
						const reorderedOptions = arrayMove(options, activeIndex, overIndex);

						updated[questionIndex] = {
							...question,
							data: {
								...question.data,
								options: reorderedOptions,
							},
						} as FormElementConfig;
					}
				}
			}

			return updated;
		});
	};

	const publishForm = async (formId: string) => {
		try {
			toast.info("Starting Publishing");
			// Filter questions to only include visible fields for CONTACT_INFO and ADDRESS types

			const response = await api.post(`form/${formId}/publish-with-questions`, {
				questions: formStepData,
			});

			toast("Form Published");
		} catch (error) {
			toast.error("Failed to publish form ");
		}
	};

	return (
		<FormStepContext.Provider
			value={{
				formStepData,
				loading,
				error,
				addElements,
				setElements,
				changeQuestionProperty,
				changeFieldProperty,
				removeStep,
				reorderSteps,
				addOption,
				updateOption,
				removeOption,
				reorderOptions,
				publishForm,
			}}
		>
			{children}
		</FormStepContext.Provider>
	);
}

export const useFormStepData = () => {
	const context = useContext(FormStepContext);
	if (!context) {
		throw new Error("FormStepContext must be used within ContextProvider");
	}
	return context;
};
