"use client";
import React, { useState } from "react";
import { ElementType } from "../../components/FormElements/FormElements";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormAnswers } from "@/context/FormAnswerContext";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const { answers, setAnswer, isSubmitting } = useFormAnswers();
	const { formData } = useFormContext();
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);
	const answerData = answers.find(
		(data) => data.questionId == formDataCurrent?.id
	);

	return (
		<div className=" flex flex-col gap-2 ">
			<div className="text-black">
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{formDataCurrent?.title}
					{formDataCurrent?.required && (
						<span className="text-red-500 ml-1">*</span>
					)}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{formDataCurrent?.description}
				</div>
				<textarea
					disabled={disabled}
					minLength={formDataCurrent?.data?.minLength || undefined}
					maxLength={formDataCurrent?.data?.maxLength || undefined}
					style={
						{
							"--placeholder-color": formData.settings.answerColor,
							color: formData.settings.answerColor,
							borderColor: formData.settings.answerColor,
						} as React.CSSProperties
					}
					placeholder={formDataCurrent?.data?.placeholder}
					className={`border-2 border-solid rounded border-gray-300 w-full focus:outline-none placeholder-[var(--placeholder-color)] p-3 resize-y mb-4 ${
						formDataCurrent?.data?.size === "small"
							? "min-h-[80px]"
							: formDataCurrent?.data?.size === "medium"
							? "min-h-[120px]"
							: formDataCurrent?.data?.size === "large"
							? "min-h-[200px]"
							: formDataCurrent?.data?.size === "very-large"
							? "min-h-[300px]"
							: "min-h-[120px]" // default medium
					}`}
					value={answerData?.answer || ""}
					onChange={(e) =>
						setAnswer(formDataCurrent?.id!, "LONG_TEXT", e.target.value)
					}
				/>

				<Button
					disabled={isSubmitting}
					className="cursor-pointer"
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
		<PropertiesSetting
			title={data?.title || ""}
			description={data?.description || ""}
			required={data?.required || false}
			onTitleChange={(title) => updateQuestionProperty("title", title)}
			onDescriptionChange={(description) =>
				updateQuestionProperty("description", description)
			}
			onRequiredChange={(required) =>
				updateQuestionProperty("required", required)
			}
		>
			{/* Long Text specific properties */}
			<div className="space-y-4">
				{/* Placeholder Field */}
				<div className="space-y-2">
					<Label htmlFor="placeholder">Placeholder Text</Label>
					<Input
						id="placeholder"
						type="text"
						value={data?.data?.placeholder || ""}
						onChange={(e) =>
							updateQuestionProperty("data", {
								...data?.data,
								placeholder: e.target.value,
							})
						}
						placeholder="Enter placeholder text"
					/>
				</div>

				{/* Button Text */}
				<div className="space-y-2">
					<Label htmlFor="buttonText">Button Text</Label>
					<Input
						id="buttonText"
						type="text"
						value={data?.buttonText || ""}
						onChange={(e) =>
							updateQuestionProperty("buttonText", e.target.value)
						}
						placeholder="Enter button text"
					/>
				</div>

				{/* Text Area Size */}
				<div className="space-y-2">
					<Label htmlFor="size">Text Area Size</Label>
					<Select
						value={data?.data?.size || "medium"}
						onValueChange={(value) =>
							updateQuestionProperty("data", {
								...data?.data,
								size: value,
							})
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select size" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="small">Small</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="large">Large</SelectItem>
							<SelectItem value="very-large">Very Large</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Min Length */}
				<div className="space-y-2">
					<Label htmlFor="minLength">Minimum Length</Label>
					<Input
						id="minLength"
						type="number"
						min="0"
						value={data?.data?.minLength || ""}
						onChange={(e) =>
							updateQuestionProperty("data", {
								...data?.data,
								minLength: e.target.value
									? parseInt(e.target.value)
									: undefined,
							})
						}
						placeholder="No minimum"
					/>
				</div>

				{/* Max Length */}
				<div className="space-y-2">
					<Label htmlFor="maxLength">Maximum Length</Label>
					<Input
						id="maxLength"
						type="number"
						min="1"
						value={data?.data?.maxLength || ""}
						onChange={(e) =>
							updateQuestionProperty("data", {
								...data?.data,
								maxLength: e.target.value
									? parseInt(e.target.value)
									: undefined,
							})
						}
						placeholder="No maximum"
					/>
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent, type };
