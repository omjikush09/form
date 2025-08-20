"use client";
import React from "react";
import { useFormStepData } from "@/context/FormStepDataContext";
import { useFormAnswers } from "@/context/FormAnswerContext";
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
				className="flex-shrink-0 p-1 text-gray-400 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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

	// Handle multi-select checkbox changes
	const handleCheckboxChange = (optionValue: string, checked: boolean) => {
		const currentAnswers = answerData?.answer || [];
		const selectionType = formDataCurrent?.data?.selectionType || "unlimited";
		const minSelections = formDataCurrent?.data?.minSelections || 0;
		const maxSelections = formDataCurrent?.data?.maxSelections || null;
		const fixedSelections = formDataCurrent?.data?.fixedSelections || null;
		let newAnswers;

		if (checked) {
			// Check limits based on selection type
			if (
				selectionType === "fixed" &&
				fixedSelections &&
				currentAnswers.length >= fixedSelections
			) {
				return; // Don't allow if fixed limit reached
			}
			if (
				selectionType === "range" &&
				maxSelections &&
				currentAnswers.length >= maxSelections
			) {
				return; // Don't allow if max limit reached
			}
			// Add the option if checked
			newAnswers = [...currentAnswers, optionValue];
		} else {
			// Check minimum when unchecking
			if (
				selectionType === "fixed" &&
				fixedSelections &&
				currentAnswers.length <= fixedSelections
			) {
				return; // Don't allow unchecking if it would go below fixed requirement
			}
			if (selectionType === "range" && currentAnswers.length <= minSelections) {
				return; // Don't allow unchecking if it would go below minimum
			}
			// Remove the option if unchecked
			newAnswers = currentAnswers.filter(
				(value: string) => value !== optionValue
			);
		}

		setAnswer(formDataCurrent?.id!, "MULTI_SELECT_OPTION", newAnswers);
	};

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
				{formDataCurrent?.data?.selectionType &&
					formDataCurrent.data.selectionType !== "unlimited" && (
						<div className="mt-2 text-sm text-gray-600">
							{formDataCurrent.data.selectionType === "fixed" &&
								formDataCurrent.data.fixedSelections && (
									<>
										Please select exactly {formDataCurrent.data.fixedSelections}{" "}
										option(s)
										{answerData?.answer?.length && (
											<span className="ml-1">
												({answerData.answer.length}/
												{formDataCurrent.data.fixedSelections} selected)
											</span>
										)}
									</>
								)}
							{formDataCurrent.data.selectionType === "range" && (
								<>
									Select {formDataCurrent.data.minSelections || 0} to{" "}
									{formDataCurrent.data.maxSelections || "unlimited"} option(s)
									{answerData?.answer?.length && (
										<span className="ml-1">
											({answerData.answer.length} selected)
										</span>
									)}
								</>
							)}
						</div>
					)}
				<div className="mt-4 flex flex-col gap-3">
					{formDataCurrent?.data &&
						formDataCurrent.data.options.map((option: any) => (
							<label
								key={option.id}
								className="flex items-center gap-3 cursor-pointer"
							>
								<input
									type="checkbox"
									disabled={disabled}
									checked={answerData?.answer?.includes(option.value) || false}
									onChange={(e) =>
										handleCheckboxChange(option.value, e.target.checked)
									}
									className="w-5 h-5 rounded border-2"
									style={{
										accentColor: formData.settings.answerColor,
										borderColor: formData.settings.answerColor,
									}}
								/>
								<span style={{ color: formData.settings.answerColor }}>
									{option.label}
								</span>
							</label>
						))}
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
			{/* Multi Select specific properties */}
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

				{/* Selection Type Controls */}
				<div className="space-y-2">
					<Label htmlFor="selectionType">Selection Type</Label>
					<Select
						value={data?.data?.selectionType || "unlimited"}
						onValueChange={(value) =>
							updateQuestionProperty("data", {
								...data?.data,
								selectionType: value,
								// Reset other values when changing type
								minSelections: undefined,
								maxSelections: undefined,
								fixedSelections: undefined,
							})
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="unlimited">Unlimited selections</SelectItem>
							<SelectItem value="fixed">Fixed number of selections</SelectItem>
							<SelectItem value="range">Min/Max range</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Fixed Selection Controls */}
				{data?.data?.selectionType === "fixed" && (
					<div className="space-y-2">
						<Label htmlFor="fixedSelections">
							Number of selections required
						</Label>
						<Input
							id="fixedSelections"
							type="number"
							min={1}
							value={data?.data?.fixedSelections || ""}
							onChange={(e) =>
								updateQuestionProperty("data", {
									...data?.data,
									fixedSelections: parseInt(e.target.value) || 1,
								})
							}
							placeholder="e.g., 3"
						/>
					</div>
				)}

				{/* Range Selection Controls */}
				{data?.data?.selectionType === "range" && (
					<>
						<div className="space-y-2">
							<Label htmlFor="minSelections">Minimum selections</Label>
							<Input
								id="minSelections"
								type="number"
								min={0}
								value={data?.data?.minSelections || ""}
								onChange={(e) =>
									updateQuestionProperty("data", {
										...data?.data,
										minSelections: parseInt(e.target.value) || 0,
									})
								}
								placeholder="e.g., 1"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="maxSelections">Maximum selections</Label>
							<Input
								id="maxSelections"
								type="number"
								min={1}
								value={data?.data?.maxSelections || ""}
								onChange={(e) =>
									updateQuestionProperty("data", {
										...data?.data,
										maxSelections: parseInt(e.target.value) || null,
									})
								}
								placeholder="e.g., 5 (leave empty for no max)"
							/>
						</div>
					</>
				)}

				{/* Options UI */}
				<div className="space-y-3">
					{/* Header */}
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-muted-foreground">
							Multi-Select Options
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
		</PropertiesSetting>
	);
}

export default { FormComponet, properTiesComponent };
