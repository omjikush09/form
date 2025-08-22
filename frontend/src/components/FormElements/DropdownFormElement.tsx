"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormAnswers, getAnswerFromQuesitonId } from "@/context/FormAnswerContext";
import { FiTrash2 } from "react-icons/fi";
import { useFormContext } from "@/context/FormContext";
import { Plus, GripVertical } from "lucide-react";
import PropertiesSetting from "@/components/PropertiesSetting";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { FormOption } from "@/config/data";

// Sortable Option Item Component
function SortableOptionItem({
	option,
	updateOptionProperty,
	handleRemoveOption,
}: {
	option: FormOption;
	updateOptionProperty: (
		optionId: string,
		property: string,
		value: string
	) => void;
	handleRemoveOption: (optionId: string) => void;
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
			className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 border rounded-md mb-2 bg-white ${
				isDragging ? "z-50 shadow-lg" : ""
			}`}
		>
			<div
				{...attributes}
				{...listeners}
				className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200/50 rounded flex-shrink-0"
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
				className="flex-1 text-gray-700 bg-transparent border-none outline-none min-w-0"
				placeholder="Enter option text"
			/>
			<button
				type="button"
				onClick={() => handleRemoveOption(option.id)}
				className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
	if (!formDataCurrent || formDataCurrent.type != "DROPDOWN") return null;
	const answerData = getAnswerFromQuesitonId(formDataCurrent.id!, "DROPDOWN");

	return (
		<div className="flex flex-col gap-2">
			<div className="">
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
				{formDataCurrent && formDataCurrent.type == "DROPDOWN" && (
					<div className="mt-4">
						<Select
							disabled={disabled}
							value={answerData ?? ""}
							onValueChange={(value) =>
								setAnswer(formDataCurrent?.id!, "DROPDOWN", value)
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
								{formDataCurrent.data &&
									formDataCurrent.data.options.map((option) => (
										<SelectItem key={option.id} value={option.value}>
											{option.label}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>
				)}

				<Button
					disabled={isSubmitting}
					className="cursor-pointer mt-4"
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

	if (!data || data.type != "DROPDOWN") return null;

	const updateQuestionProperty = (
		property: string,
		value: string | boolean
	) => {
		changeQuestionProperty(selectedStep, property, value);
	};

	const updateOptionProperty = (
		optionId: string,
		property: string,
		value: string | boolean
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
	const sortableItems = data.data.options.map((option) => option.id) || [];

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
			{/* Dropdown specific properties */}
			<div className="space-y-4">
				{/* Button Text */}
				<div className="space-y-2">
					<Label htmlFor="buttonText">Button Text</Label>
					<Input
						id="buttonText"
						type="text"
						value={data.buttonText || ""}
						onChange={(e) =>
							updateQuestionProperty("buttonText", e.target.value)
						}
						placeholder="Enter button text"
					/>
				</div>

				{/* Options UI */}
				<div className="space-y-3">
					{/* Header */}
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-muted-foreground">
							Dropdown Options
						</Label>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleAddOption}
							title="Add new option"
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>

					{/* Options List */}
					<div>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={sortableItems}
								strategy={verticalListSortingStrategy}
							>
								{data.data.options.map((option, index: number) => (
									<SortableOptionItem
										key={option.id}
										option={option}
										updateOptionProperty={updateOptionProperty}
										handleRemoveOption={handleRemoveOption}
									/>
								))}
							</SortableContext>
						</DndContext>
					</div>
				</div>
			</div>
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
