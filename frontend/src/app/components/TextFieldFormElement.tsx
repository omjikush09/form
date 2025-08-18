"use client";
import React, { useState } from "react";
import { ElementType } from "./FormElements";
import { useFormStepData } from "@/hook/useFormData";
import { useFormAnswers } from "@/components/context/FormAnswerContext";
import { useFormContext } from "@/components/context/FormContext";

const type: ElementType = "TextField";

function FormComponet({
	selectedStep,
	disabled = false,
}: {
	selectedStep: number;
	disabled: boolean;
}) {
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const { answers, setAnswer } = useFormAnswers();
	const { formData } = useFormContext();
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);
	const answerData = answers.find(
		(data) => data.questionId == formDataCurrent?.id
	);

	return (
		<div className=" flex flex-col gap-2 ">
			{formData.settings.questionColor}
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
				<input
					disabled={disabled}
					style={
						{
							"--placeholder-color": formData.settings.answerColor,
							color: formData.settings.answerColor,
						} as React.CSSProperties
					}
					placeholder={formDataCurrent?.placeholder}
					className="border-b-2 border-solid rounded border-gray-300 w-full focus:outline-none placeholder-[var(--placeholder-color)] "
					value={answerData?.answer}
					onChange={(e) =>
						setAnswer(formDataCurrent?.id!, "SHORT_TEXT", e.target.value)
					}
				/>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const data = formStepData.find((data) => data.step == selectedStep);
	return (
		<>
			<div>
				<h1>Title</h1>
				<input
					className="border-2 border-solid rounded"
					value={data?.title}
					onChange={(e) =>
						changeQuestionProperty(selectedStep, "title", e.target.value)
					}
				/>
				<h1>PlaceHolder </h1>
				<input
					className="border-2 border-solid rounded"
					value={data?.placeholder}
					onChange={(e) =>
						changeQuestionProperty(selectedStep, "placeholder", e.target.value)
					}
				/>
			</div>
		</>
	);
}

export default { FormComponet, properTiesComponent, type };
