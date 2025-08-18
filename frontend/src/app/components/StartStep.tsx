"use client";
import React, { useState } from "react";
import { ElementType } from "./FormElements";
import { useFormStepData } from "@/hook/useFormData";
import { Button } from "@/components/ui/button";
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
	const { formData } = useFormContext();
	const data = formStepData.find((data) => data.step == selectedStep);
	return (
		<div className="flex flex-col gap-4 ">
			<div>
				{/* {JSON.stringify(data)} */}
				{/* xcx */}
				<h1
					className="text-4xl"
					style={{ color: formData.settings.questionColor }}
				>
					{data?.title}
				</h1>
				<div style={{color:formData.settings.descriptionColor}} >{data?.description}</div>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const { formStepData: formData, changeFormData } = useFormStepData();
	const data = formData.find((data) => data.step == selectedStep);
	return (
		<>
			<div>
				<h1>Title</h1>
				<input
					className="border-2 border-solid rounded"
					value={data?.title}
					onChange={(e) =>
						changeFormData(selectedStep, "title", e.target.value)
					}
				/>
			</div>
		</>
	);
}

export default { FormComponet, properTiesComponent, type };
