"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormComponentProps } from "./types";

function FormComponet({
	selectedStep,
	buttonOnClink = () => {},
	isSubmitting,
}: FormComponentProps) {
	const { formStepData } = useFormStepData();
	const { formData } = useFormContext();
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);
	if (!formDataCurrent || formDataCurrent.type != "STATEMENT") return null;

	return (
		<div className=" flex flex-col gap-2 ">
			<div className="text-black">
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{formDataCurrent.title}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{formDataCurrent.description}
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
					{formDataCurrent.buttonText}
				</Button>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const data = formStepData.find((data) => data.step == selectedStep);
	if (!data || data.type != "STATEMENT") return;

	const updateQuestionProperty = (
		property: string,
		value: string | boolean
	) => {
		changeQuestionProperty(selectedStep, property, value);
	};

	return (
		<PropertiesSetting
			title={data.title}
			description={data.description}
			required={data.required || false}
			onTitleChange={(title) => updateQuestionProperty("title", title)}
			onDescriptionChange={(description) =>
				updateQuestionProperty("description", description)
			}
			onRequiredChange={(required) =>
				updateQuestionProperty("required", required)
			}
		>
			{/* Statement specific properties */}
			<div className="space-y-4">
				{/* Button Text */}
				<div className="space-y-2">
					<Label htmlFor="buttonText">Button Text</Label>
					<Input
						id="buttonText"
						type="text"
						value={data.buttonText || ""}
						onChange={(e) =>
							updateQuestionProperty("buttonText", e.target.value)
						}
						placeholder="Enter button text"
					/>
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
