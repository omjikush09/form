"use client";
import { ElementDefaultData } from "@/config/data";
import { useFormStepData } from "@/hook/useFormData";
import { FormStepData } from "@/components/context/FormStepDataContext";
import React, { Dispatch, SetStateAction } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, GripVertical } from "lucide-react";
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
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Step Item Component
function SortableStepItem({
	data,
	selectedQuestions,
	setSelectedQuestions,
	removeStep,
}: {
	data: FormStepData;
	selectedQuestions: number;
	setSelectedQuestions: Dispatch<SetStateAction<number>>;
	removeStep: (step: number) => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: data.step });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isDraggable = !(data.type === "START_STEP" || data.type === "END_STEP");

	return (
		<div
			ref={setNodeRef}
			style={style}
			key={data.step}
			onClick={() => {
				setSelectedQuestions(data.step);
			}}
			className={`px-2 py-1.5 mb-2 ${ElementDefaultData[data.type]?.color} ${
				data.step == selectedQuestions
					? " border-dashed border-1 border-black"
					: ""
			}rounded flex items-center gap-2 cursor-pointer ${
				isDragging ? "z-50" : ""
			}`}
		>
			{isDraggable && (
				<div
					{...attributes}
					{...listeners}
					className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200/50 rounded"
				>
					<GripVertical className="w-4 h-4 text-gray-400" />
				</div>
			)}
			{ElementDefaultData[data.type]?.icon}{" "}
			<h1 className="truncate text-[12px]">{data.title}</h1>
			{!(data.type == "START_STEP") && !(data.type == "END_STEP") && (
				<div className="ml-auto">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="p-1 rounded cursor-pointer">
								<HiOutlineDotsVertical className="w-4 h-4" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								variant="destructive"
								onClick={(e) => {
									e.stopPropagation();
									removeStep(data.step);
								}}
							>
								<Trash2 className="w-4 h-4" />
								Delete Step
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</div>
	);
}

function StepList({
	selectedQuestions,
	setSelectedQuestions,
}: {
	selectedQuestions: number;
	setSelectedQuestions: Dispatch<SetStateAction<number>>;
}) {
	const { formStepData, removeStep, reorderSteps } = useFormStepData();

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			reorderSteps(Number(active.id), Number(over.id));
		}
	}

	// Create items array for SortableContext (only draggable steps)
	const sortableItems = formStepData.map((data) => data.step);

	return (
		<div className="bg-[#f2f4f7] p-2 pt-4 h-full overflow-y-auto">
			<p className="text-gray-500 text-sm mb-2">Blocks</p>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={sortableItems}
					strategy={verticalListSortingStrategy}
				>
					{formStepData
						?.sort((a, b) => a.step - b.step)
						.map((data) => (
							<SortableStepItem
								key={data.step}
								data={data}
								selectedQuestions={selectedQuestions}
								setSelectedQuestions={setSelectedQuestions}
								removeStep={removeStep}
							/>
						))}
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default StepList;
