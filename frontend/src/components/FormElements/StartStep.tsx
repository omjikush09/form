"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormComponentProps } from "./types";

function FormComponet({
	selectedStep,
	disabled = false,
	buttonOnClink = () => {},
	isSubmitting,
}: FormComponentProps) {
	const { formStepData } = useFormStepData();
	const { formData } = useFormContext();

	const data = formStepData.find((data) => data.step == selectedStep);
	return (
		<div className="flex flex-col gap-8 ">
			<div>
				{/* {JSON.stringify(data)} */}
				{/* xcx */}
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{data?.title}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{data?.description}
				</div>

				<Button
					disabled={isSubmitting}
					className="cursor-pointer"
					style={{
						color: formData.settings.buttonTextColor,
						backgroundColor: formData.settings.buttonColor,
					}}
					// disabled={disabled}
					onClick={buttonOnClink}
				>
					{data?.buttonText ?? "next"}
				</Button>
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
			onRequiredChange={() => {}} // Not applicable for start step
		>
			{/* Start Step specific properties */}
			<div className="space-y-4">
				{/* Button Text */}
				<div className="space-y-2">
					<Label htmlFor="buttonText">Button Text</Label>
					<Input
						id="buttonText"
						type="text"
						value={data?.buttonText || ""}
						onChange={(e) =>
							changeQuestionProperty(selectedStep, "buttonText", e.target.value)
						}
						placeholder="Enter button text"
					/>
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
