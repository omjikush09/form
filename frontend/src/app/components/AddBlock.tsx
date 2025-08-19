import { ElementDefaultData, formTypes } from "@/config/data";
import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa6";
import { useFormStepData } from "@/hook/useFormData";

function AddBlock({ formId }: { formId: string }) {
	const { addElements } = useFormStepData();
	return (
		<Dialog>
			<DialogTrigger className="border-2 px-2  py-1 rounded bg-[#f9fafb] text-bold text-[14px] flex items-center gap-0.5  ">
				<FaPlus size={10} /> Add Block
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Pick a block you want to add</DialogTitle>
					<DialogDescription>
						{formTypes.map((type) => {
							return (
								<div
									key={type}
									onClick={() => {
										addElements(formId, type);
									}}
									className={`cursor-pointer flex text-black  items-center gap-2 p-2 mb-2 ${ElementDefaultData[type]?.color}`}
								>
									{ElementDefaultData[type]?.icon}
									{type}
								</div>
							);
						})}
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

export default AddBlock;
