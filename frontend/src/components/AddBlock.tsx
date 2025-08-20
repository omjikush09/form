import { ElementDefaultData, formTypes } from "@/config/data";
import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa6";
import { useFormStepData } from "@/context/FormStepDataContext";
import { makeFirstLetterUpperCase } from "@/util/helper";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function AddBlock({ formId }: { formId: string }) {
	const { addElements } = useFormStepData();
	const [selectedBlock, setSelectedBlock] = useState<
		(typeof formTypes)[0] | undefined
	>();
	return (
		<Dialog>
			<DialogTrigger className="border-2 px-2  py-1 rounded bg-[#f9fafb] text-bold text-[14px] flex items-center gap-0.5  ">
				<FaPlus size={10} /> Add Block
			</DialogTrigger>
			<DialogContent
				className="overflow-y-auto max-h-[80%]"
				style={{ width: "58%", maxWidth: "800px" }}
			>
				<DialogHeader>
					<DialogTitle>Choose your block</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-3 gap-2">
					<div className=" space-y-2">
						{formTypes.map((type) => {
							return (
								<div
									key={type}
									onClick={() => {
										setSelectedBlock(type);
									}}
									className={`  cursor-pointer flex text-black  items-center gap-2 p-2 rounded  ${
										ElementDefaultData[type]?.color
									} ${
										type == selectedBlock &&
										"border-dashed border-1 border-violet-500 "
									} `}
								>
									{ElementDefaultData[type].icon}
									<h1 className="truncate">{makeFirstLetterUpperCase(type)}</h1>
								</div>
							);
						})}
					</div>
					<div className="col-span-2 border-[0.05px] rounded border-gray-300 p-4">
						{selectedBlock && (
							<div className="space-y-4 flex flex-col items-center">
								<h1 className="text-center text-2xl font-bold ">
									{makeFirstLetterUpperCase(selectedBlock)}
								</h1>
								<Image
									className="w-full h-[300px] border-4 border-gray-300 rounded "
									src={ElementDefaultData[selectedBlock].thumbnail}
									alt={selectedBlock}
									width={400}
									height={300}
								/>
								<Button
									className="cursor-pointer"
									onClick={() => {
										addElements(formId, selectedBlock);
									}}
								>
									Use this block <ArrowRight />
								</Button>
							</div>
						)}
						{!selectedBlock && (
							<div className="space-y-2">
								<h1 className="text-center text-2xl font-bold">
									No Block selected
								</h1>
								<p className="text-gray-400 text-sm text-center">
									Select a block from left to know about it and to use in the
									form.
								</p>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AddBlock;
