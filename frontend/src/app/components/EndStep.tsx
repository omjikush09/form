"use client";
import React, { useState } from "react";
import { ElementType } from "./FormElements";
import { useFormStepData } from "@/hook/useFormData";
import { useFormContext } from "@/components/context/FormContext";
import QuestionProperties from "./QuestionProperties";

const type: ElementType = "TextField";

function FormComponet({
	selectedStep,
	disabled = false,
}: {
	selectedStep: number;
	disabled: boolean;
}) {
	const { formStepData } = useFormStepData();
	const { formData } = useFormContext();
	const data = formStepData.find((data) => data.step == selectedStep);
	return (
		<div className="  ">
			<div className="flex flex-col gap-2">
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{data?.title}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{data?.description}
				</div>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const { formStepData: formData, changeFormData } = useFormStepData();
	const data = formData.find((data) => data.step == selectedStep);

	return (
		<div className="pt-5 px-2 bg-[#f2f4f7] h-full">
			{/* Question Level Properties */}
			<QuestionProperties
				title={data?.title || ""}
				description={data?.description || ""}
				onTitleChange={(title) => changeFormData(selectedStep, "title", title)}
				onDescriptionChange={(description) =>
					changeFormData(selectedStep, "description", description)
				}
			/>
		</div>
	);
}

export default { FormComponet, properTiesComponent, type };
