"use client";
import React from "react";
import { ElementType } from "./FormElements";
import { useFormStepData } from "@/hook/useFormData";
import { useFormAnswers } from "@/components/context/FormAnswerContext";
import { useFormContext } from "@/components/context/FormContext";
import QuestionProperties from "./QuestionProperties";
import { Button } from "@/components/ui/button";

const type: ElementType = "TextField";

function FormComponet({
	selectedStep,
	disabled = false,
	buttonOnClink = () => {},
}: {
	selectedStep: number;
	disabled: boolean;
	buttonOnClink?: () => void;
}) {
	const { formStepData } = useFormStepData();
	const { answers, setAnswer, isSubmitting } = useFormAnswers();
	const { formData } = useFormContext();
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);

	return (
		<div className=" flex flex-col gap-2 ">
			<div className="text-black">
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{formDataCurrent?.title}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{formDataCurrent?.description}
				</div>

				<Button
					disabled={isSubmitting}
					className="cursor-pointer mt-4"
					style={{
						color: formData.settings.buttonTextColor,
						backgroundColor: formData.settings.buttonColor,
					}}
					onClick={buttonOnClink}
				>
					{formDataCurrent?.buttonText}
				</Button>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const data = formStepData.find((data) => data.step == selectedStep);

	const updateQuestionProperty = (property: string, value: any) => {
		changeQuestionProperty(selectedStep, property, value);
	};

	return (
		<div className="pt-5 px-2 bg-[#f2f4f7] h-full">
			{/* Question Level Properties */}
			<QuestionProperties
				title={data?.title || ""}
				description={data?.description || ""}
				onTitleChange={(title) => updateQuestionProperty("title", title)}
				onDescriptionChange={(description) =>
					updateQuestionProperty("description", description)
				}
			/>

			<div className="mb-3">
				<label className="block text-sm font-medium text-gray-700">
					Button Text
				</label>
				<input
					type="text"
					value={data?.buttonText || ""}
					onChange={(e) => updateQuestionProperty("buttonText", e.target.value)}
					className="block px-3 py-2 mt-1 w-full rounded-md border-2 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
				/>
			</div>
		</div>
	);
}

export default { FormComponet, properTiesComponent, type };