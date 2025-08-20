"use client";
import { useParams } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
import { IoRocketOutline } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import { IoBuildSharp } from "react-icons/io5";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import React, { useEffect, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import AddBlock from "@/app/components/AddBlock";
import { useFormStepData } from "@/hook/useFormData";
import StepList from "@/components/StepList";
import { FormElement } from "@/app/components/FormElements";
import FormDesign from "@/components/FormDesign";
import { useFormContext } from "@/components/context/FormContext";

function Build() {
	const params = useParams<{ formId: string }>();
	const { formId } = params;
	const { formData, loading: formContextLoading, error: formContextError, fetchFormData } = useFormContext();

	const [selectedStep, setSelectedStep] = useState<number>(0);

	const { setElements, formStepData, publishForm, loading: formStepLoading, error: formStepError } = useFormStepData();
  

	useEffect(() => {
		if (formId) {
			setElements(formId);
			fetchFormData(formId);
		}
	}, [formId]);

	const stepData = formStepData.find((data) => data.step == selectedStep);

	// Show loading spinner if either form context or form step data is loading
	const isLoading = formContextLoading || formStepLoading || !formId;
	const hasError = formContextError || formStepError;

	if (hasError) {
		return (
			<div className="flex flex-col h-full items-center justify-center">
				<div className="text-red-500 text-xl mb-4">⚠️</div>
				<p className="text-lg text-gray-600 mb-4">Something went wrong</p>
				<p className="text-sm text-gray-500">Please try refreshing the page</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col h-full items-center justify-center">
				<Spinner className="w-8 h-8 mb-4" />
				<p className="text-lg text-gray-600">Loading form...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full ">
			{/* {JSON.stringify(stepData)} */}
			{/* {JSON.stringify(formData)} */}
			<div className="flex justify-between border-b-1 p-2">
				<div className="flex justify-center items-center gap-4">
					<IoMdArrowBack color="blue" size={40} />
					<Separator orientation="vertical" />
					<h4 className="text-3xl">
						{formData.title}
					</h4>
				</div>
				<div className="px-5 py-1 border shadow-2xl hover:bg-gray-300 rounded cursor-pointer">
					<div className="flex flex-col items-center">
						<IoBuildSharp />
						<p className="text-blue-400 text-sm">Build</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Tooltip>
						<TooltipTrigger>
							<div className="px-5 py-2 bg-[#dbfde5] rounded cursor-pointer">
								<div className="flex flex-col items-center">
									{" "}
									<CiPlay1 size={20} />
								</div>
							</div>
							<TooltipContent>
								<p>Preview</p>
							</TooltipContent>
						</TooltipTrigger>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							className="flex gap-2 items-center bg-black rounded text-white p-2"
							onClick={() => publishForm(formId)}
						>
							<IoRocketOutline color="white" /> Publish
						</TooltipTrigger>
						<TooltipContent>
							<p>Make your Changes live</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div className="flex-1 h-full">
				<div className="grid grid-cols-[250px_3fr_1fr] gap-2 h-full">
					<div className="h-full">
						<StepList
							selectedQuestions={selectedStep}
							setSelectedQuestions={setSelectedStep}
						/>
					</div>

					<div className="flex flex-col ">
						<div className="p-2 px-4 bg-[#f2f4f7] my-2 rounded-3xl flex gap-2">
							<AddBlock formId={formId} />
							{/* {selectedStep}
							{JSON.stringify(stepData)} */}
							<FormDesign />
						</div>
						<div
							className={`flex-1 grid place-items-center  mb-2 `}
							style={{
								backgroundColor: formData.settings.backgroundColor,
								fontFamily: `${formData.settings.fontFamily}, sans-serif`,
							}}
						>
							{(() => {
								if (selectedStep == undefined || !stepData?.type) return;
								const Component = FormElement[stepData.type].FormComponet;
								return (
									<Component selectedStep={selectedStep} disabled={true} />
								);
							})()}
						</div>
					</div>
					<div>
						{(() => {
							if (!stepData?.type) return;
							const Component = FormElement[stepData.type].properTiesComponent;
							return <Component selectedStep={selectedStep} />;
						})()}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Build;
