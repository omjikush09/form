"use client";
import React, { useState } from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";

function FormComponet({
	selectedStep,
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
	const { formStepData: formData, changeQuestionProperty } = useFormStepData();
	const data = formData.find((data) => data.step == selectedStep);

	return (
		<PropertiesSetting
			title={data?.title || ""}
			description={data?.description || ""}
			required={false}
			onTitleChange={(title) =>
				changeQuestionProperty(selectedStep, "title", title)
			}
			onDescriptionChange={(description) =>
				changeQuestionProperty(selectedStep, "description", description)
			}
			onRequiredChange={() => {}} // Not applicable for end step
		>
			{/* End Step - no additional properties needed */}
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
