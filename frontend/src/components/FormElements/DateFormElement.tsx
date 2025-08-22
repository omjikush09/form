"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { useReactFormHookContext } from "@/context/reactHookFormContext";

import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormElementDataTypes } from "@/config/data";
import { BaseFormElementComponentProps, FormComponentProps } from "./types";

type currentData = FormElementDataTypes["DATE"];

const DateInputComponent = ({
	field,
	disabled,
	formData,
	formDataCurrent,
}: BaseFormElementComponentProps & { formDataCurrent: currentData }) => {
	return (
		<Input
			{...field}
			value={field?.value || ""}
			type="date"
			disabled={disabled}
			style={
				{
					color: formData.settings.answerColor,
					borderColor: formData.settings.answerColor,
				} as React.CSSProperties
			}
			className="border-2 border-solid rounded border-gray-300 w-full focus:outline-none p-3 mb-4"
		/>
	);
};

function FormComponet({
	selectedStep,
	disabled = false,
	buttonOnClink = () => {},
	isSubmitting,
}: FormComponentProps) {
	const { formStepData } = useFormStepData();

	const { formData } = useFormContext();
	const form = useReactFormHookContext();
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);
	if (!formDataCurrent || formDataCurrent.type != "DATE") return null;

	return (
		<div className=" flex flex-col gap-2 ">
			<div className="text-black">
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{formDataCurrent.title}
					{formDataCurrent.required && (
						<span className="text-red-500 ml-1">*</span>
					)}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{formDataCurrent.description}
				</div>
				{form && form.control ? (
					<FormField
						control={form.control}
						name={formDataCurrent.id!}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<DateInputComponent
										field={field}
										disabled={disabled}
										formData={formData}
										formDataCurrent={formDataCurrent}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<DateInputComponent
						disabled={disabled}
						formData={formData}
						formDataCurrent={formDataCurrent}
					/>
				)}

				<Button
					disabled={isSubmitting}
					className="cursor-pointer"
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
	if (!data || data.type != "DATE") return null;
	const updateQuestionProperty = (
		property: string,
		value: string | boolean
	) => {
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
			{/* Date specific properties */}
			<div className="space-y-4">
				{/* Button Text */}
				<div className="space-y-2">
					<Label htmlFor="buttonText">Button Text</Label>
					<Input
						id="buttonText"
						type="text"
						value={data.buttonText}
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
