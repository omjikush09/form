"use client";
import React from "react";
import { useFormStepData } from "@/hook/useFormData";
import { useFormAnswers } from "@/components/context/FormAnswerContext";
import { FiTrash2 } from "react-icons/fi";
import { useFormContext } from "@/components/context/FormContext";
import { Plus, GripVertical } from "lucide-react";
import QuestionProperties from "./QuestionProperties";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

// Sortable Option Item Component
function SortableOptionItem({
	option,
	updateOptionProperty,
	handleRemoveOption,
	isLast,
}: {
	option: any;
	updateOptionProperty: (
		optionId: string,
		property: string,
		value: string
	) => void;
	handleRemoveOption: (optionId: string) => void;
	isLast: boolean;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: option.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-2 rounded mb-2 ${
				!isLast ? "border-b border-gray-100" : ""
			} ${isDragging ? "z-50" : ""}`}
		>
			<div
				{...attributes}
				{...listeners}
				className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200/50 rounded mr-2"
			>
				<GripVertical className="w-4 h-4 text-gray-400" />
			</div>
			<input
				type="text"
				value={option.label}
				onChange={(e) => {
					updateOptionProperty(option.id, "label", e.target.value);
					updateOptionProperty(option.id, "value", e.target.value);
				}}
				className="text-gray-700 bg-transparent border-none outline-none flex-1 cursor-pointer"
				placeholder="Enter option text"
			/>
			<button
				type="button"
				onClick={() => handleRemoveOption(option.id)}
				className="text-gray-400 hover:text-red-500 transition-colors ml-2"
				title="Remove option"
			>
				<FiTrash2 className="w-4 h-4" />
			</button>
		</div>
	);
}

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
		<div className="flex flex-col gap-2">
			<div className="">
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
				<div className="mt-4">
					<Select
						disabled={disabled}
						value={answerData?.answer || ""}
						onValueChange={(value) =>
							setAnswer(
								formDataCurrent?.id!,
								"DROPDOWN",
								value
							)
						}
					>
						<SelectTrigger 
							className="w-full p-3 border-2 rounded-md"
							style={{
								borderColor: formData.settings.answerColor,
								color: formData.settings.answerColor,
							}}
						>
							<SelectValue placeholder="Choose an option..." />
						</SelectTrigger>
						<SelectContent>
							{formDataCurrent?.data &&
								formDataCurrent.data.options.map((option: any) => (
									<SelectItem key={option.id} value={option.value}>
										{option.label}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
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
					{formDataCurrent?.buttonText}
				</Button>
			</div>
		</div>
	);
}

function properTiesComponent({ selectedStep }: { selectedStep: number }) {
	const {
		formStepData: formData,
		changeQuestionProperty,
		addOption,
		updateOption,
		removeOption,
		reorderOptions,
	} = useFormStepData();

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const data = formData.find((data) => data.step == selectedStep);

	if (!data) return null;

	const updateQuestionProperty = (property: string, value: any) => {
		changeQuestionProperty(selectedStep, property, value);
	};

	const updateOptionProperty = (
		optionId: string,
		property: string,
		value: any
	) => {
		updateOption(selectedStep, optionId, property, value);
	};

	const handleAddOption = () => {
		const newOption = {
			id: uuidv4(),
			label: "New Option",
			value: "New Option",
		};
		addOption(selectedStep, newOption);
	};

	const handleRemoveOption = (optionId: string) => {
		removeOption(selectedStep, optionId);
	};

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			reorderOptions(selectedStep, String(active.id), String(over.id));
		}
	}

	// Create items array for SortableContext
	const sortableItems =
		data.data?.options?.map((option: any) => option.id) || [];

	return (
		<div className="pt-5 px-2 bg-[#f2f4f7] h-full">
			{/* Question Level Properties */}
			<QuestionProperties
				title={data?.title || ""}
				description={data?.description || ""}
				onTitleChange={(title) => updateQuestionProperty("title", title)}
				onDescriptionChange={(description) =>
					updateQuestionProperty("description", description)
				}
			/>
			
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
			
			<div className="flex items-center mb-3">
				<div className="flex h-6 items-center">
					<input
						id="required-field"
						type="checkbox"
						checked={data?.required || false}
						onChange={(e) => updateQuestionProperty("required", e.target.checked)}
						className="h-4 w-4 rounded-sm border-gray-300 text-gray-600 focus:ring-gray-600 focus:outline-hidden focus:ring-0"
					/>
				</div>
				<div className="ml-2 text-sm">
					<label htmlFor="required-field" className="text-gray-600">
						Make this field required?
					</label>
				</div>
			</div>

			{/* Options UI */}
			<div className="  ">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 ">
					<div className="flex items-center gap-2">
						<span className="text-gray-700 font-medium">Options</span>
					</div>
					<button
						type="button"
						onClick={handleAddOption}
						className="text-gray-400 hover:text-blue-500 transition-colors"
						title="Add new option"
					>
						<Plus className="w-4 h-4" />
					</button>
				</div>

				{/* Options List */}
				<div className="py-2">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={sortableItems}
							strategy={verticalListSortingStrategy}
						>
							{data.data?.options?.map((option: any, index: number) => (
								<SortableOptionItem
									key={option.id}
									option={option}
									updateOptionProperty={updateOptionProperty}
									handleRemoveOption={handleRemoveOption}
									isLast={index === data.data.options.length - 1}
								/>
							))}
						</SortableContext>
					</DndContext>
				</div>
			</div>
		</div>
	);
}

export default { FormComponet, properTiesComponent };