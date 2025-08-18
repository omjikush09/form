import { FormElementTypes } from "@/config/data";
import TextFieldFormElement from "./TextFieldFormElement";
import StartStep from "./StartStep";
import EndStep from "./EndStep";
import ContactFormElement from "./ContactFormElement";
export type ElementType = "TextField";

export type FormElement = {
	type: ElementType;

	FormComponet: React.FC<{ selectedStep: number; disabled: boolean }>;
	properTiesComponent: React.FC<{ selectedStep: number }>;
};

type FormElementType = {
	[key in FormElementTypes]: FormElement;
};

export const FormElement: FormElementType = {
	SHORT_TEXT: TextFieldFormElement,
	LONG_TEXT: TextFieldFormElement,
	START_STEP: StartStep,
	END_STEP: EndStep,
	CONTACT_INFO: ContactFormElement,
};
