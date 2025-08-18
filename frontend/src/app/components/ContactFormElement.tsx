"use client";
import React, { useState } from "react";
import { ElementType } from "./FormElements";
import { useFormStepData } from "@/hook/useFormData";
import { useFormAnswers } from "@/components/context/FormAnswerContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { useFormContext } from "@/components/context/FormContext";

const type: ElementType = "TextField";

function FormComponet({
	selectedStep,
	disabled = false,
}: {
	selectedStep: number;
	disabled: boolean;
}) {
	const { formStepData } = useFormStepData();
	const { answers, setAnswer } = useFormAnswers();
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
											className="focus:outline-none border-b-2 border-solid border-black"
											required={data.required}
											type={data.type}
											style={
												{
													"--placeholder-color": formData.settings.answerColor,
													color: formData.settings.answerColor,
												} as React.CSSProperties
											}
											placeholder={data.placeholder}
											name={data.id}
											value={answerData?.answer[data.id]?.value || ""}
											onChange={(e) =>
												setAnswer(
													formDataCurrent?.id!,
													"CONTACT_INFO",
													e.target.value,
													data.id
												)
											}
										/>
									</label>
								);
							})}
				</div>
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
		<div className="mt-8">
			{/* Question Level Properties */}
			<div className="mb-6 p-4 border rounded-sm bg-gray-100">
				<div className="mb-3">
					<label className="block text-sm font-medium text-gray-700">
						Question Title
					</label>
					<input
						type="text"
						value={data?.title || ""}
						onChange={(e) => updateQuestionProperty("title", e.target.value)}
						className="block mt-1 w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
					/>
				</div>
				<div className="mb-3">
					<label className="block text-sm font-medium text-gray-700">
						Question Description
					</label>
					<textarea
						value={data?.description || ""}
						onChange={(e) =>
							updateQuestionProperty("description", e.target.value)
						}
						className="block w-full rounded-md mt-1 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm focus:ring-1"
						rows={3}
					/>
				</div>
			</div>

			{/* Field Level Properties */}
			{data.data?.fields?.map((field: any) => (
				<div key={field.id} className="mt-4">
					<div className="flex items-center justify-between mt-4">
						<label className="block text-sm font-light text-gray-800">
							{field.title}
						</label>
						<div className="flex items-center space-x-4">
							{/* Show/Hide Toggle Icon */}
							<button
								type="button"
								onClick={() => toggleFieldDisplay(field.id)}
								className="text-gray-500 hover:text-gray-700"
							>
								{field.display ? (
									<FiEye className="size-5" />
								) : (
									<FiEyeOff className="size-5" />
								)}
							</button>

							{/* Settings Icon */}
							<button
								type="button"
								className="text-gray-500 hover:text-gray-700"
								onClick={() =>
									setOpenSettings(openSettings === field.id ? null : field.id)
								}
							>
								<IoSettingsOutline className="size-5" />
							</button>
						</div>
					</div>

					{/* Settings Panel */}
					{openSettings === field.id && (
						<div className="mt-2 p-4 border rounded-sm bg-gray-100">
							<div className="mb-3">
								<label className="block text-sm font-medium text-gray-700">
									Label
								</label>
								<input
									type="text"
									value={field.title}
									onChange={(e) =>
										updateFieldProperty(field.id, "title", e.target.value)
									}
									className="block mt-1 w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								/>
							</div>
							<div className="mb-3">
								<label className="block text-sm font-medium text-gray-700">
									Placeholder
								</label>
								<input
									type="text"
									value={field.placeholder}
									onChange={(e) =>
										updateFieldProperty(field.id, "placeholder", e.target.value)
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
									<label
										htmlFor={`${field.id}-required`}
										className="text-gray-600"
									>
										Make this required?
									</label>
								</div>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export default { FormComponet, properTiesComponent, type };
