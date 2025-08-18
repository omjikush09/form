import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { IoColorPaletteOutline } from "react-icons/io5";
import { useFormContext } from "@/components/context/FormContext";

function FormDesign() {
	const { formData, updateSettings, saveFormData, saving } = useFormContext();
	const { settings } = formData;

	const updateDesign = (property: string, value: string) => {
		updateSettings({ [property]: value });
	};

	const fontOptions = [
		"Inter",
		"Arial",
		"Helvetica",
		"Georgia",
		"Times New Roman",
		"Roboto",
		"Open Sans",
		"Lato",
		"Montserrat",
		"Poppins",
	];

	return (
		<Dialog>
			<DialogTrigger className="border-2 px-2 py-1 rounded bg-[#f9fafb] text-bold text-[14px] flex items-center gap-0.5">
				<IoColorPaletteOutline size={14} /> Design
			</DialogTrigger>
			<DialogContent className="max-w-md max-h-[90%] overflow-auto">
				<DialogHeader>
					<DialogTitle className="text-lg font-medium text-gray-900">
						Form Design
					</DialogTitle>
					<DialogDescription className="text-sm text-gray-500">
						Customize the appearance of your form
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-6 overflow-auto  ">
					{/* Background Color */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Background Color
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="color"
								value={settings.backgroundColor}
								onChange={(e) =>
									updateDesign("backgroundColor", e.target.value)
								}
								className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400"
								title="Click to pick background color"
							/>
							<input
								type="text"
								value={settings.backgroundColor}
								onChange={(e) =>
									updateDesign("backgroundColor", e.target.value)
								}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								placeholder="#ffffff"
							/>
						</div>
					</div>

					{/* Question Color */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Question Color
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="color"
								value={settings.questionColor}
								onChange={(e) => updateDesign("questionColor", e.target.value)}
								className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400"
								title="Click to pick question color"
							/>
							<input
								type="text"
								value={settings.questionColor}
								onChange={(e) => updateDesign("questionColor", e.target.value)}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								placeholder="#000000"
							/>
						</div>
					</div>

					{/* Description Color */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Description Color
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="color"
								value={settings.descriptionColor}
								onChange={(e) =>
									updateDesign("descriptionColor", e.target.value)
								}
								className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400"
								title="Click to pick description color"
							/>
							<input
								type="text"
								value={settings.descriptionColor}
								onChange={(e) =>
									updateDesign("descriptionColor", e.target.value)
								}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								placeholder="#6b7280"
							/>
						</div>
					</div>

					{/* Answer Color */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Answer Color
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="color"
								value={settings.answerColor}
								onChange={(e) => updateDesign("answerColor", e.target.value)}
								className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400"
								title="Click to pick answer color"
							/>
							<input
								type="text"
								value={settings.answerColor}
								onChange={(e) => updateDesign("answerColor", e.target.value)}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								placeholder="#374151"
							/>
						</div>
					</div>

					{/* Button Color */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Button Color
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="color"
								value={settings.buttonColor}
								onChange={(e) => updateDesign("buttonColor", e.target.value)}
								className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400"
								title="Click to pick button color"
							/>
							<input
								type="text"
								value={settings.buttonColor}
								onChange={(e) => updateDesign("buttonColor", e.target.value)}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								placeholder="#3b82f6"
							/>
						</div>
					</div>

					{/* Button Text Color */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Button Text Color
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="color"
								value={settings.buttonTextColor}
								onChange={(e) =>
									updateDesign("buttonTextColor", e.target.value)
								}
								className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer hover:border-gray-400"
								title="Click to pick button text color"
							/>
							<input
								type="text"
								value={settings.buttonTextColor}
								onChange={(e) =>
									updateDesign("buttonTextColor", e.target.value)
								}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
								placeholder="#ffffff"
							/>
						</div>
					</div>

					{/* Font Family */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Font Family
						</label>
						<select
							value={settings.fontFamily}
							onChange={(e) => updateDesign("fontFamily", e.target.value)}
							className="block w-full rounded-md border-gray-300 shadow-xs focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
						>
							{fontOptions.map((font) => (
								<option key={font} value={font} style={{ fontFamily: font }}>
									{font}
								</option>
							))}
						</select>
					</div>

					{/* Save Button */}
					<div className="flex justify-end pt-4 border-t border-gray-200">
						<button
							onClick={saveFormData}
							disabled={saving}
							className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving ? "Saving..." : "Save Design"}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default FormDesign;
