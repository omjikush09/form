"use client";
import React, { useState } from "react";
import { ElementType } from "./FormElements";
import { useFormStepData } from "@/hook/useFormData";
import { useFormAnswers } from "@/components/context/FormAnswerContext";
import { useFormContext } from "@/components/context/FormContext";
import QuestionProperties from "./QuestionProperties";
import { Button } from "@/components/ui/button";
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
		<div className="pt-5 px-2 bg-[#f2f4f7] h-full overflow-auto">
			{/* Question Level Properties */}
			<QuestionProperties
				title={data?.title || ""}
				description={data?.description || ""}
				onTitleChange={(title) => updateQuestionProperty("title", title)}
				onDescriptionChange={(description) =>
					updateQuestionProperty("description", description)
				}
			/>

			{/* Placeholder Field */}
			<div className="mb-3">
				<label className="block text-sm font-medium text-gray-700">
					Placeholder Text
				</label>
				<input
					type="text"
					value={data?.data?.placeholder || ""}
					onChange={(e) =>
						updateQuestionProperty("data", {
							...data?.data,
							placeholder: e.target.value,
						})
					}
					className="block px-3 py-2 mt-1 w-full rounded-md border-2 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
				/>
			</div>
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

			{/* Text Area Size */}
			<div className="mb-3">
				<label className="block text-sm font-medium text-gray-700">
					Text Area Size
				</label>
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
			<div className="mb-3">
				<label className="block text-sm font-medium text-gray-700">
					Minimum Length
				</label>
				<input
					type="number"
					min="0"
					value={data?.data?.minLength || ""}
					onChange={(e) =>
						updateQuestionProperty("data", {
							...data?.data,
							minLength: e.target.value ? parseInt(e.target.value) : undefined,
						})
					}
					className="block px-3 py-2 mt-1 w-full rounded-md border-2 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
					placeholder="No minimum"
				/>
			</div>

			{/* Max Length */}
			<div className="mb-3">
				<label className="block text-sm font-medium text-gray-700">
					Maximum Length
				</label>
				<input
					type="number"
					min="1"
					value={data?.data?.maxLength || ""}
					onChange={(e) =>
						updateQuestionProperty("data", {
							...data?.data,
							maxLength: e.target.value ? parseInt(e.target.value) : undefined,
						})
					}
					className="block px-3 py-2 mt-1 w-full rounded-md border-2 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
					placeholder="No maximum"
				/>
			</div>

			<div className="flex items-center mb-3">
				<div className="flex h-6 items-center">
					<input
						id="required-field"
						type="checkbox"
						checked={data?.required || false}
						onChange={(e) =>
							updateQuestionProperty("required", e.target.checked)
						}
						className="h-4 w-4 rounded-sm border-gray-300 text-gray-600 focus:ring-gray-600 focus:outline-hidden focus:ring-0"
					/>
				</div>
				<div className="ml-2 text-sm">
					<label htmlFor="required-field" className="text-gray-600">
						Make this field required?
					</label>
				</div>
			</div>
		</div>
	);
}

export default { FormComponet, properTiesComponent, type };
