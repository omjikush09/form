"use client";
import { FormElement } from "@/components/FormElements/FormElements";
import { FormAnswer, useFormAnswers } from "@/context/FormAnswerContext";
import { useFormContext } from "@/context/FormContext";
import { FormStepData } from "@/context/FormStepDataContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useFormStepData } from "@/context/FormStepDataContext";
import api from "@/util/axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function Form() {
	const { formId } = useParams<{ formId: string }>();
	const {
		formStepData,
		setElements,
		loading: formStepLoading,
		error: formStepError,
	} = useFormStepData();
	const {
		formData,
		fetchFormData,
		loading: formContextLoading,
		error: formContextError,
	} = useFormContext();
	const [currentStep, setCurrentStep] = useState(0);
	const { setAnswers, submitAnswers, validateQuestion, canProceedToNext } =
		useFormAnswers();

	const getQuestions = async (formId: string) => {
		try {
			setElements(formId);
		} catch (error) {
			toast.error("Failed to Fetch From data. Please try again later");
		}
	};
	const nextStep = () => {
		const steps = formStepData.length - 1;
		const currentStepData = formStepData.find(
			(data) => data.step === currentStep
		);

		// Skip validation for START_STEP and END_STEP
		if (
			currentStepData?.type === "START_STEP" ||
			currentStepData?.type === "END_STEP"
		) {
			if (currentStep < steps) {
				setCurrentStep(currentStep + 1);
			}
			return;
		}

		// Validate current step before proceeding
		if (
			currentStepData &&
			!canProceedToNext(currentStepData.id!, currentStepData)
		) {
			const errors = validateQuestion(currentStepData.id!, currentStepData);
			errors.forEach((error) => {
				if (error.field === "general") {
					toast.error(error.message);
				} else {
					toast.error(`${error.field}: ${error.message}`);
				}
			});
			return;
		}

		if (currentStep < steps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleButtonOnClick = async () => {
		const currentStepData = formStepData.find(
			(data) => data.step === currentStep
		);

		// Validate before submission if this is the last question step
		if (currentStep == formStepData.length - 2) {
			if (
				currentStepData &&
				!canProceedToNext(currentStepData.id!, currentStepData)
			) {
				const errors = validateQuestion(currentStepData.id!, currentStepData);
				errors.forEach((error) => {
					if (error.field === "general") {
						toast.error(error.message);
					} else {
						toast.error(`${error.field}: ${error.message}`);
					}
				});
				return;
			}

			console.log("Submitting");
			const success = await submitAnswers(formId);
			if (!success) return;
		}
		nextStep();
	};

	useEffect(() => {
		if (formId) {
			getQuestions(formId);
			fetchFormData(formId);
		}
	}, [formId]);
	useEffect(() => {
		const filteredData = formStepData.filter(
			(data) => data.type != "START_STEP" && data.type != "END_STEP"
		);
		const ans: FormAnswer[] = filteredData.map((data) => {
			if (data.type == "CONTACT_INFO") {
				const answers: Record<string, { title: string; value: string }> = {};
				data.data.fields.forEach(
					(data: any) => (answers[data.id] = { value: "", title: data.title })
				);
				return {
					questionId: data.id!,
					answer: answers,
				};
			}
			if (data.type == "ADDRESS") {
				const answers: Record<string, { title: string; value: string }> = {};
				data.data.fields.forEach(
					(data: any) => (answers[data.id] = { value: "", title: data.title })
				);
				return {
					questionId: data.id!,
					answer: answers,
				};
			}
			return { questionId: data.id!, answer: "" };
		});
		setAnswers(ans);
	}, [formStepData]);

	useEffect(() => {
		if (currentStep == formStepData.length - 1) {
		}
	}, [currentStep]);

	const stepData = formStepData.find((data) => data.step == currentStep);

	// Show loading spinner if either form context or form step data is loading
	const isLoading = formContextLoading || formStepLoading;
	const hasError = formContextError || formStepError;

	if (hasError) {
		return (
			<div className="flex flex-col h-full items-center justify-center">
				<div className="text-red-500 text-xl mb-4">⚠️</div>
				<p className="text-lg text-gray-600 mb-4">Something went wrong</p>
				<p className="text-sm text-gray-500">Please try refreshing the page</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col h-full items-center justify-center">
				<Spinner className="w-8 h-8 mb-4" />
				<p className="text-lg text-gray-600">Loading form...</p>
			</div>
		);
	}

	return (
		<div
			className=" grid place-items-center h-full w-full"
			style={{
				backgroundColor: formData.settings.backgroundColor,
				fontFamily: `${formData.settings.fontFamily}, sans-serif`,
			}}
		>
			<div className="flex flex-col gap-2">
				{/* {JSON.stringify(formData)} */}

				{/* {JSON.stringify(formStepData)} */}
				{(() => {
					if (!stepData?.type) return;
					const Component = FormElement[stepData.type].FormComponet;
					return (
						<Component
							selectedStep={currentStep}
							disabled={false}
							buttonOnClink={handleButtonOnClick}
						/>
					);
				})()}
			</div>
		</div>
	);
}

export default Form;
