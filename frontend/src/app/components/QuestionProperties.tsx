"use client";
import React from "react";

interface QuestionPropertiesProps {
	title: string;
	description: string;
	onTitleChange: (title: string) => void;
	onDescriptionChange: (description: string) => void;
}

function QuestionProperties({
	title,
	description,
	onTitleChange,
	onDescriptionChange,
}: QuestionPropertiesProps) {
	return (
		<div className="mb-6">
			<div className="mb-3">
				<label className="block text-sm font-medium">Question Title</label>
				<input
					type="text"
					value={title || ""}
					onChange={(e) => onTitleChange(e.target.value)}
					className="block px-3 py-2 mt-1 w-full rounded-md border-2 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
				/>
			</div>
			<div className="mb-3">
				<label className="block text-sm font-medium text-gray-700">
					Question Description
				</label>
				<textarea
					value={description || ""}
					onChange={(e) => onDescriptionChange(e.target.value)}
					className="block w-full px-3 py-2 rounded-md mt-1 border-2 border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm focus:ring-1"
					rows={3}
				/>
			</div>
			
		</div>
	);
}

export default QuestionProperties;