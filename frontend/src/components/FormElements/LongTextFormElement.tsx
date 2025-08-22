"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { useReactFormHookContext } from "@/context/reactHookFormContext";
import { BaseFormElementComponentProps, FormComponentProps } from "./types";
import { FormElementDataTypes } from "@/config/data";
import { toast } from "sonner";
type currentData = FormElementDataTypes["LONG_TEXT"];

const TextareaComponent = ({
	field,
	disabled,
	formData,
	formDataCurrent,
}: BaseFormElementComponentProps & { formDataCurrent: currentData }) => {
	return (
		<Textarea
			{...field}
			value={field?.value || ""}
			disabled={disabled}
			minLength={formDataCurrent.data.minLength || undefined}
			maxLength={formDataCurrent.data.maxLength || undefined}
			style={
				{
					"--placeholder-color": formData.settings.answerColor,
					color: formData.settings.answerColor,
					borderColor: formData.settings.answerColor,
				} as React.CSSProperties
			}
			placeholder={formDataCurrent.data.placeholder}
			className={`border-2 border-solid rounded border-gray-300 w-full focus:outline-none placeholder-[var(--placeholder-color)] p-3 resize-y mb-4 ${
				formDataCurrent.data.size === "small"
					? "min-h-[80px]"
					: formDataCurrent.data.size === "medium"
					? "min-h-[120px]"
					: formDataCurrent.data.size === "large"
					? "min-h-[200px]"
					: formDataCurrent.data.size === "very-large"
					? "min-h-[300px]"
					: "min-h-[120px]" // default medium
			}`}
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
	if (!formDataCurrent || formDataCurrent.type != "LONG_TEXT") return null;

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
									<TextareaComponent
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
					<TextareaComponent
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
	if (!data || data.type != "LONG_TEXT") return;
	const updateQuestionProperty = (
		property: string,
		value: string | boolean | {}
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
						value={data.data.size || "medium"}
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
						value={data.data.minLength || ""}
						onChange={(e) => {
							const value = parseInt(e.target.value);
							if (!isNaN(value)) {
								if (data?.data?.minLength && value > data?.data?.minLength) {
									toast.error("Min value should be less than max value");
									return;
								}
							}
							updateQuestionProperty("data", {
								...data?.data,
								minLength: e.target.value ? value : undefined,
							});
						}}
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
						value={data.data.maxLength || ""}
						onChange={(e) => {
							const value = parseInt(e.target.value);
							if (!isNaN(value)) {
								if (data?.data?.minLength && value < data?.data?.minLength) {
									toast.error("Max value should be greater then min value");
									return;
								}
							}
							updateQuestionProperty("data", {
								...data?.data,
								maxLength: e.target.value ? value : undefined,
							});
						}}
						placeholder="No maximum"
					/>
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
