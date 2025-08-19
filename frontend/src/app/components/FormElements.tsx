import { FormElementTypes } from "@/config/data";
import ShortTextFromElement from "./ShortTextFormElement";
import LongTextFormElement from "./LongTextFormElement";
import StartStep from "./StartStep";
import EndStep from "./EndStep";
import ContactFormElement from "./ContactFormElement";
import SingleSelectOption from "./SingleSelectOption";
import MultiSelectOption from "./MultiSelectOption";
import AddressFormElement from "./AddressFormElement";
import DateFormElement from "./DateFormElement";
import NumberFormElement from "./NumberFormElement";
import StatementFormElement from "./StatementFormElement";
import URLFormElement from "./URLFormElement";
import DropdownFormElement from "./DropdownFormElement";
export type ElementType = "TextField";

export type FormElement = {
	FormComponet: React.FC<{
		selectedStep: number;
		disabled: boolean;
		buttonOnClink?: () => void;
	}>;
	properTiesComponent: React.FC<{ selectedStep: number }>;
};

type FormElementType = {
	[key in FormElementTypes]: FormElement;
};

export const FormElement: FormElementType = {
	SHORT_TEXT: ShortTextFromElement,
	LONG_TEXT: LongTextFormElement,
	START_STEP: StartStep,
	END_STEP: EndStep,
	CONTACT_INFO: ContactFormElement,
	SINGLE_SELECT_OPTION: SingleSelectOption,
	MULTI_SELECT_OPTION: MultiSelectOption,
	ADDRESS: AddressFormElement,
	DATE: DateFormElement,
	NUMBER: NumberFormElement,
	STATEMENT: StatementFormElement,
	URL: URLFormElement,
	DROPDOWN: DropdownFormElement,
};
