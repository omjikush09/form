import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface PropertiesSettingProps {
	title: string;
	description: string;
	required: boolean;
	onTitleChange: (title: string) => void;
	onDescriptionChange: (description: string) => void;
	onRequiredChange: (required: boolean) => void;
	children?: React.ReactNode; // For element-specific properties
}

const PropertiesSetting: React.FC<PropertiesSettingProps> = ({
	title,
	description,
	required,
	onTitleChange,
	onDescriptionChange,
	onRequiredChange,
	children,
}) => {
	return (
		<div className="h-full max-h-full overflow-y-auto overflow-x-auto shadow-2xl  bg-white border-l-1 px-6 py-4">
			<div className="space-y-6">
				{/* Basic Properties */}
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => onTitleChange(e.target.value)}
							placeholder="Enter question title"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => onDescriptionChange(e.target.value)}
							placeholder="Enter question description"
							rows={3}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="required" className="text-sm font-medium">
							Required
						</Label>
						<Switch
							id="required"
							checked={required}
							onCheckedChange={onRequiredChange}
						/>
					</div>
				</div>

				{/* Element-specific properties */}
				{children && (
					<>
						<div className="space-y-4">{children}</div>
					</>
				)}
			</div>
		</div>
	);
};

export default PropertiesSetting;
