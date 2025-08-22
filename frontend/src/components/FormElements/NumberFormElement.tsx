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
import { FormElementDataTypes } from "@/config/data";
import { BaseFormElementComponentProps, FormComponentProps } from "./types";

type currentData = FormElementDataTypes["NUMBER"];

const NumberInputComponent = ({
	field,
	disabled,
	formData,
	formDataCurrent,
}: BaseFormElementComponentProps & { formDataCurrent: currentData }) => {
	return (
		<Input
			{...field}
			type="number"
			disabled={disabled}
			min={formDataCurrent.data.minValue || undefined}
			max={formDataCurrent.data.maxValue || undefined}
			style={
				{
					"--placeholder-color": formData.settings.answerColor,
					color: formData.settings.answerColor,
					borderColor: formData.settings.answerColor,
				} as React.CSSProperties
			}
			placeholder={formDataCurrent.data.placeholder}
			className="border-2 border-solid rounded border-gray-300 w-full focus:outline-none placeholder-[var(--placeholder-color)] p-3 mb-4"
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
	const hasFormContext = form && form.control;
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);
	if (!formDataCurrent || formDataCurrent.type != "NUMBER") return null;

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
				{hasFormContext ? (
					<FormField
						control={form.control}
						name={formDataCurrent.id!}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<NumberInputComponent
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
					<NumberInputComponent
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

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const { formStepData, changeQuestionProperty } = useFormStepData();
	const data = formStepData.find((data) => data.step == selectedStep);
	if (!data || data.type != "NUMBER") return;

	return (
		<PropertiesSetting
			title={data?.title || ""}
			description={data?.description || ""}
			required={data?.required || false}
			onTitleChange={(title) =>
				changeQuestionProperty(selectedStep, "title", title)
			}
			onDescriptionChange={(description) =>
				changeQuestionProperty(selectedStep, "description", description)
			}
			onRequiredChange={(required) =>
				changeQuestionProperty(selectedStep, "required", required)
			}
		>
			{/* Number specific properties */}
			<div className="space-y-4">
				{/* Placeholder Field */}
				<div className="space-y-2">
					<Label htmlFor="placeholder">Placeholder Text</Label>
					<Input
						id="placeholder"
						type="text"
						value={data?.data?.placeholder || ""}
						onChange={(e) =>
							changeQuestionProperty(selectedStep, "data", {
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
							changeQuestionProperty(selectedStep, "buttonText", e.target.value)
						}
						placeholder="Enter button text"
					/>
				</div>

				{/* Min Value Field */}
				<div className="space-y-2">
					<Label htmlFor="minValue">Minimum Value</Label>
					<Input
						id="minValue"
						type="number"
						value={data?.data?.minValue || ""}
						onChange={(e) =>
							changeQuestionProperty(selectedStep, "data", {
								...data?.data,
								minValue: e.target.value
									? parseFloat(e.target.value)
									: undefined,
							})
						}
						placeholder="e.g., 0 (leave empty for no minimum)"
					/>
				</div>

				{/* Max Value Field */}
				<div className="space-y-2">
					<Label htmlFor="maxValue">Maximum Value</Label>
					<Input
						id="maxValue"
						type="number"
						value={data?.data?.maxValue || ""}
						onChange={(e) =>
							changeQuestionProperty(selectedStep, "data", {
								...data?.data,
								maxValue: e.target.value
									? parseFloat(e.target.value)
									: undefined,
							})
						}
						placeholder="e.g., 100 (leave empty for no maximum)"
					/>
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
