"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { useReactFormHookContext } from "@/context/reactHookFormContext";
import {
	BaseFormElementComponentProps,
	FormComponentProps,
	PropertiesComponentProps,
} from "./types";
import { FormDefaultData } from "@/config/data";

type currentData = (typeof FormDefaultData)["SHORT_TEXT"];

const InputComponent = ({
	field,
	disabled,
	formData,
	formDataCurrent,
}: BaseFormElementComponentProps & { formDataCurrent: currentData }) => {
	return (
		<Input
			{...field}
			value={field?.value || ""}
			disabled={disabled}
			style={
				{
					"--placeholder-color": formData.settings.answerColor,
					color: formData.settings.answerColor,
					borderColor: formData.settings.answerColor,
				} as React.CSSProperties
			}
			placeholder={formDataCurrent.data.placeholder}
			className="border-b-2 border-solid rounded border-gray-300 w-full focus:outline-none placeholder-[var(--placeholder-color)] mb-4"
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
		(data) => data.step === selectedStep
	);

	if (!formDataCurrent || formDataCurrent.type !== "SHORT_TEXT") {
		return null;
	}
	const currentData = formDataCurrent;

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
									<InputComponent
										field={field}
										disabled={disabled}
										formData={formData}
										formDataCurrent={currentData}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<InputComponent
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
					{formDataCurrent?.buttonText}
				</Button>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: PropertiesComponentProps) {
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const data = formStepData.find((data) => data.step == selectedStep);
	if (data?.type != "SHORT_TEXT") return null;
	const updateQuestionProperty = (
		property: string,
		value: string | boolean | {}
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
			{/* Short Text specific properties */}
			<div className="space-y-4">
				{/* Placeholder Field */}
				<div className="space-y-2">
					<Label htmlFor="placeholder">Placeholder Text</Label>
					<Input
						id="placeholder"
						type="text"
						value={data.data.placeholder || ""}
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
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
