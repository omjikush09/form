"use client";
import React, { useState } from "react";
import { ElementType } from "../../components/FormElements/FormElements";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormAnswers } from "@/context/FormAnswerContext";
import { Eye, EyeOff, Settings } from "lucide-react";
import { useFormContext } from "@/context/FormContext";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
	const { formStepData } = useFormStepData();
	const { answers, setAnswer, isSubmitting } = useFormAnswers();
	const { formData } = useFormContext();
	const formDataCurrent = formStepData.find(
		(data) => data.step == selectedStep
	);
	const answerData = answers.find(
		(data) => data.questionId == formDataCurrent?.id
	);

	return (
		<div className=" flex flex-col gap-2">
			<div className="">
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{formDataCurrent?.title}
				</h1>
				<div style={{ color: formData.settings.descriptionColor }}>
					{formDataCurrent?.description}
				</div>
				<div className="grid grid-cols-2 gap-2">
					{formDataCurrent?.data &&
						formDataCurrent.data.fields
							.filter((data: any) => data.display === true)
							.map((data: any) => {
								return (
									<label key={data.id} className="flex flex-col gap-2">
										<div style={{ color: formData.settings.questionColor }}>
											{data.title}
											{data.required && (
												<span className="text-red-500 text-sm">*</span>
											)}
										</div>
										<input
											disabled={disabled}
											className="focus:outline-none border-b-2 border-solid"
											required={data.required}
											type={data.type}
											style={
												{
													"--placeholder-color": formData.settings.answerColor,
													color: formData.settings.answerColor,
													borderColor: formData.settings.answerColor,
												} as React.CSSProperties
											}
											placeholder={data.placeholder}
											name={data.id}
											value={answerData?.answer[data.id]?.value || ""}
											onChange={(e) =>
												setAnswer(
													formDataCurrent?.id!,
													"ADDRESS",
													e.target.value,
													data.id
												)
											}
										/>
									</label>
								);
							})}
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
					{formDataCurrent?.buttonText ?? "Next"}
				</Button>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const {
		formStepData: formData,
		changeQuestionProperty,
		changeFieldProperty,
	} = useFormStepData();
	const [openSettings, setOpenSettings] = useState<string | null>(null);
	const data = formData.find((data) => data.step == selectedStep);

	if (!data) return null;

	const updateQuestionProperty = (property: string, value: any) => {
		changeQuestionProperty(selectedStep, property, value);
	};

	const updateFieldProperty = (
		fieldId: string,
		property: string,
		value: any
	) => {
		changeFieldProperty(selectedStep, fieldId, property, value);
	};

	const toggleFieldDisplay = (fieldId: string) => {
		const field = data.data.fields.find((f: any) => f.id === fieldId);
		updateFieldProperty(fieldId, "display", !field.display);
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
			{/* Address specific properties */}
			<div className="space-y-4">
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

				{/* Field Level Properties */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-muted-foreground">
						Address Fields
					</h4>
					{data.data?.fields?.map((field: any) => (
						<div key={field.id}>
							{/* Field Header */}
							<div className="flex items-center justify-between mt-4">
								<Label className="block text-sm font-light text-gray-800">
									{field.title}
								</Label>
								<div className="flex items-center space-x-4">
									{/* Visibility Toggle Icon */}
									<button
										type="button"
										onClick={() => toggleFieldDisplay(field.id)}
										className="text-gray-500 hover:text-gray-700"
										title={field.display ? "Hide field" : "Show field"}
									>
										{field.display ? (
											<Eye className="w-5 h-5" />
										) : (
											<EyeOff className="w-5 h-5" />
										)}
									</button>

									{/* Settings Gear Icon */}
									<button
										type="button"
										className="text-gray-500 hover:text-gray-700"
										onClick={() =>
											setOpenSettings(
												openSettings === field.id ? null : field.id
											)
										}
									>
										<Settings className="w-5 h-5" />
									</button>
								</div>
							</div>

							{/* Collapsible Settings Panel */}
							{openSettings === field.id && (
								<div className="mt-2 p-4 border rounded-sm bg-gray-100">
									<div className="mb-3">
										<Label className="block text-sm font-medium text-gray-700">
											Label
										</Label>
										<Input
											type="text"
											value={field.title}
											onChange={(e) =>
												updateFieldProperty(field.id, "title", e.target.value)
											}
											className="block mt-1 w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
										/>
									</div>
									<div className="mb-3">
										<Label className="block text-sm font-medium text-gray-700">
											Placeholder
										</Label>
										<Input
											type="text"
											value={field.placeholder}
											onChange={(e) =>
												updateFieldProperty(
													field.id,
													"placeholder",
													e.target.value
												)
											}
											className="block w-full rounded-md mt-1 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm focus:ring-1"
										/>
									</div>
									<div className="flex items-center">
										<div className="flex h-6 items-center">
											<input
												id={`${field.id}-required`}
												type="checkbox"
												checked={field.required}
												onChange={(e) =>
													updateFieldProperty(
														field.id,
														"required",
														e.target.checked
													)
												}
												className="h-4 w-4 rounded-sm border-gray-300 text-gray-600 focus:ring-gray-600 focus:outline-hidden focus:ring-0"
											/>
										</div>
										<div className="ml-2 text-sm">
											<Label
												htmlFor={`${field.id}-required`}
												className="text-gray-600"
											>
												Make this required?
											</Label>
										</div>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent, type };
