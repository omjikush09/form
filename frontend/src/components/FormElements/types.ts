import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { FormElementConfig } from "@/context/FormStepDataContext";
import { FormConfigData } from "@/context/FormContext";

export interface FormComponentProps {
	selectedStep: number;
	disabled: boolean;
	buttonOnClink?: () => void;
	isSubmitting: boolean;
}

export interface PropertiesComponentProps {
	selectedStep: number;
}

export interface BaseFormElementComponentProps {
	field?: ControllerRenderProps<FieldValues, FieldPath<FieldValues>>;
	disabled: boolean;
	formData: FormConfigData;
	formDataCurrent: FormElementConfig;
}
