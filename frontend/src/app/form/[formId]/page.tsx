"use client";
import { FormElement } from "@/app/components/FormElements";
import {
	FormAnswer,
	useFormAnswers,
} from "@/components/context/FormAnswerContext";
import { FormStepData } from "@/components/context/FormStepDataContext";
import { Button } from "@/components/ui/button";
import { useFormStepData } from "@/hook/useFormData";
import api from "@/util/axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function Form() {
	const { formId } = useParams<{ formId: string }>();
	const { formStepData, setElements } = useFormStepData();
	const [currentStep, setCurrentStep] = useState(0);
	const {
		answers,
		setAnswers,
		submitAnswers,
		isSubmitting,
		validateQuestion,
		canProceedToNext,
	} = useFormAnswers();

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

	useEffect(() => {
		if (formId) {
			console.log(formId);
			getQuestions(formId);
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
			return { questionId: data.id!, answer: "" };
		});
		setAnswers(ans);
	}, [formStepData]);

	useEffect(() => {
		if (currentStep == formStepData.length - 1) {
		}
	}, [currentStep]);
	const stepData = formStepData.find((data) => data.step == currentStep);
	return (
		<div className=" grid place-items-center h-full w-full bg-red-300">
			<div className="flex flex-col gap-2">
				{/* {JSON.stringify(answers)}
			
				{JSON.stringify(formStepData)} */}
				{(() => {
					if (!stepData?.type) return;
					const Component = FormElement[stepData.type].FormComponet;
					return <Component selectedStep={currentStep} disabled={false} />;
				})()}
				{currentStep < formStepData.length - 1 && (
					<Button
						disabled={isSubmitting}
						className="cursor-pointer"
						onClick={async () => {
							const currentStepData = formStepData.find(
								(data) => data.step === currentStep
							);

							// Validate before submission if this is the last question step
							if (currentStep == formStepData.length - 2) {
								if (
									currentStepData &&
									!canProceedToNext(currentStepData.id!, currentStepData)
								) {
									const errors = validateQuestion(
										currentStepData.id!,
										currentStepData
									);
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
						}}
					>
						{" "}
						{stepData?.buttonText || "Next"}{" "}
					</Button>
				)}
			</div>
		</div>
	);
}

export default Form;
