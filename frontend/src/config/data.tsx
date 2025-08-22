import { FaGripLines } from "react-icons/fa6";
import { IoPersonOutline } from "react-icons/io5";
import { RxDropdownMenu } from "react-icons/rx";
import { CiLocationOn } from "react-icons/ci";
import { MdCheckBox } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { BsHash } from "react-icons/bs";
import { FaRegFileAlt } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";

export type FormElementTypes =
	| "SHORT_TEXT"
	| "LONG_TEXT"
	| "START_STEP"
	| "END_STEP"
	| "CONTACT_INFO"
	| "SINGLE_SELECT_OPTION"
	| "MULTI_SELECT_OPTION"
	| "ADDRESS"
	| "DATE"
	| "NUMBER"
	| "URL"
	| "DROPDOWN"
	| "STATEMENT";

export type AddElementFromType =
	| "SHORT_TEXT"
	| "LONG_TEXT"
	| "CONTACT_INFO"
	| "SINGLE_SELECT_OPTION"
	| "MULTI_SELECT_OPTION"
	| "STATEMENT"
	| "DATE"
	| "NUMBER"
	| "URL"
	| "DROPDOWN"
	| "ADDRESS"; // Type that can be added as block

// Base types for form field options
export type FormOption = {
	id: string;
	label: string;
	value: string;
};

export type inputValues = "text" | "email" | "tel" | "number";

export type FormFieldData = {
	id: string;
	title: string;
	type: inputValues;
	placeholder?: string;
	required: boolean;
	display: boolean;
};

// Data types for each form element type
export type ShortTextDataType = {
	placeholder?: string;
};

export type LongTextDataType = {
	placeholder?: string;
	minLength?: number;
	maxLength?: number;
	size: "medium" | "small" | "large" | "very-large";
};

export type NumberDataType = {
	placeholder?: string;
	minValue?: number;
	maxValue?: number;
};

export type URLDataType = {
	placeholder?: string;
};

export type DateDataType = {
	placeholder?: string;
	minDate?: string;
	maxDate?: string;
};

export type DropdownDataType = {
	options: FormOption[];
	placeholder?: string;
};

export type SingleSelectDataType = {
	options: FormOption[];
	allowOther?: boolean;
};

export type MultiSelectDataType = {
	options: FormOption[];
	selectionType: "unlimited" | "fixed" | "range";
	minSelections?: number;
	maxSelections?: number;
	fixedSelections?: number;
	allowOther?: boolean;
};

type ContactInfoDataType = {
	fields: FormFieldData[];
};

type AddressDataType = {
	fields: FormFieldData[];
};

type StatementDataType = {
	// Statement typically doesn't have additional data properties
};

type StartStepDataType = {
	// Start step typically doesn't have additional data properties
};

type EndStepDataType = {
	// End step typically doesn't have additional data properties
};

// Complete type mapping for all form data types
type FormDataByType = {
	SHORT_TEXT: ShortTextDataType;
	LONG_TEXT: LongTextDataType;
	NUMBER: NumberDataType;
	URL: URLDataType;
	DATE: DateDataType;
	DROPDOWN: DropdownDataType;
	SINGLE_SELECT_OPTION: SingleSelectDataType;
	MULTI_SELECT_OPTION: MultiSelectDataType;
	CONTACT_INFO: ContactInfoDataType;
	ADDRESS: AddressDataType;
	STATEMENT: StatementDataType;
	START_STEP: StartStepDataType;
	END_STEP: EndStepDataType;
};

export type FormElementDataTypes = typeof FormDefaultData;

export const FormDefaultData: {
	[K in FormElementTypes]: {
		id?: string;
		required: boolean;
		title: string;
		step: number;
		description: string;
		type: K;
		buttonText: string;
		data: FormDataByType[K];
	};
} = {
	START_STEP: {
		required: false,
		title: "Hey there 😀",
		step: 0,
		description: "Mind filling out this form?",
		type: "START_STEP",
		buttonText: "Get Started",
		data: {},
	},
	END_STEP: {
		required: false,
		title: "Thank you! 🙌",
		step: 0, // Will be overridden when added to form
		description: "That's all. You may now close this window.",
		type: "END_STEP",
		buttonText: "Complete",
		data: {},
	},
	SHORT_TEXT: {
		required: false,
		title: "Enter the title",
		step: 0, // Will be overridden when added to form
		description: "Description",
		data: {
			placeholder: "your answer",
		},
		type: "SHORT_TEXT",
		buttonText: "Next",
	},
	LONG_TEXT: {
		required: false,
		title: "Enter the title for long text",
		step: 0, // Will be overridden when added to form
		description: "Description",
		data: {
			size: "medium",
			placeholder: "Your answer",
			minLength: undefined,
			maxLength: undefined,
		},
		type: "LONG_TEXT",
		buttonText: "Next",
	},
	STATEMENT: {
		required: false,
		title: "Enter your title",
		step: 0, // Will be overridden when added to form
		description: "",
		type: "STATEMENT",
		buttonText: "Next",
		data: {},
	},
	NUMBER: {
		required: false,
		title: "Pick a Number",
		step: 0, // Will be overridden when added to form
		description: "Enter a number",
		type: "NUMBER",
		data: {
			placeholder: "Pick a Number",
			minValue: undefined,
			maxValue: undefined,
		},
		buttonText: "Next",
	},
	URL: {
		required: false,
		title: "Enter a Website URL",
		step: 0, // Will be overridden when added to form
		description: "URL",
		type: "URL",
		data: {
			placeholder: "https://",
		},
		buttonText: "Next",
	},
	DROPDOWN: {
		required: false,
		title: "Please select an option",
		step: 0, // Will be overridden when added to form
		description: "Select an option",
		type: "DROPDOWN",
		buttonText: "Next",
		data: {
			options: [
				{
					id: uuidv4(),
					label: "Option 1",
					value: "Option 1",
				},
				{
					id: uuidv4(),
					label: "Option 2",
					value: "Option 2",
				},
			],
			placeholder: "Select an option",
		},
	},
	DATE: {
		required: false,
		title: "Pick a Date",
		step: 0, // Will be overridden when added to form
		description: "Date",
		type: "DATE",
		data: {
			placeholder: "Pick a date",
			minDate: undefined,
			maxDate: undefined,
		},
		buttonText: "Next",
	},

	SINGLE_SELECT_OPTION: {
		required: false,
		title: "Please select an option",
		step: 0, // Will be overridden when added to form
		description: "Select an option",
		type: "SINGLE_SELECT_OPTION",
		buttonText: "Next",
		data: {
			options: [
				{
					id: uuidv4(),
					label: "Option 1",
					value: "Option 1",
				},
				{
					id: uuidv4(),
					label: "Option 2",
					value: "Option 2",
				},
			],
			allowOther: false,
		},
	},
	MULTI_SELECT_OPTION: {
		required: false,
		title: "Please select options",
		step: 0, // Will be overridden when added to form
		description: "Select multiple options",
		type: "MULTI_SELECT_OPTION",
		buttonText: "Next",
		data: {
			options: [
				{
					id: uuidv4(),
					label: "Option 1",
					value: "Option 1",
				},
				{
					id: uuidv4(),
					label: "Option 2",
					value: "Option 2",
				},
			],
			selectionType: "unlimited",
			minSelections: undefined,
			maxSelections: undefined,
			fixedSelections: undefined,
			allowOther: false,
		},
	},
	CONTACT_INFO: {
		title: "Could you share a bit about yourself?",
		step: 0, // Will be overridden when added to form
		description: "About yourself",
		type: "CONTACT_INFO",
		buttonText: "Next",
		required: false,
		data: {
			fields: [
				{
					id: uuidv4(),
					title: "First Name",
					placeholder: "Your first name",
					type: "text",
					required: true,
					display: true,
				},
				{
					id: uuidv4(),
					title: "Last Name",
					placeholder: "Your last name",
					type: "text",
					required: true,
					display: true,
				},
				{
					id: uuidv4(),
					title: "Email",
					placeholder: "your.email@example.com",
					type: "email",
					required: true,
					display: true,
				},
				{
					id: uuidv4(),
					title: "Phone Number",
					placeholder: "+1 (555) 123-4567",
					type: "tel",
					required: false,
					display: true,
				},
			],
		},
	},
	ADDRESS: {
		required: false,
		title: "Please enter your complete address",
		step: 0, // Will be overridden when added to form
		description: "Address",
		type: "ADDRESS",
		buttonText: "Next",
		data: {
			fields: [
				{
					id: uuidv4(),
					title: "Address",
					type: "text",
					placeholder: "123 main street",
					required: false,
					display: true,
				},
				{
					id: uuidv4(),
					title: "Address line 2",
					type: "text",
					placeholder: "Apt., studio, or floor",
					required: false,
					display: true,
				},
				{
					id: uuidv4(),
					title: "City",
					type: "text",
					placeholder: "San Francisco",
					required: false,
					display: true,
				},
				{
					id: uuidv4(),
					title: "State",
					type: "text",
					placeholder: "California",
					required: false,
					display: true,
				},
				{
					id: uuidv4(),
					title: "Zip",
					type: "number",
					placeholder: "Zip",
					required: false,
					display: true,
				},
				{
					id: uuidv4(),
					title: "Country",
					type: "text",
					placeholder: "Country",
					required: false,
					display: true,
				},
			],
		},
	},
};

// export type ElementDataTypes<T extends FormElementTypes> = FormData[T];

export const formTypes: AddElementFromType[] = [
	"SHORT_TEXT",
	"LONG_TEXT",
	"CONTACT_INFO",
	"SINGLE_SELECT_OPTION",
	"MULTI_SELECT_OPTION",
	"ADDRESS",
	"DATE",
	"STATEMENT",
	"NUMBER",
	"URL",
	"DROPDOWN",
];

interface ElementDataDefaults {
	icon: React.ReactNode;
	color: string;
	thumbnail: string;
}

export const ElementDefaultData: Record<FormElementTypes, ElementDataDefaults> =
	{
		SHORT_TEXT: {
			icon: <FaGripLines />,
			color: "bg-blue-300",
			thumbnail: "/images/shortText.jpeg",
		},
		LONG_TEXT: {
			icon: <FaGripLines />,
			color: "bg-red-400",
			thumbnail: "/images/longText.jpeg",
		},
		START_STEP: {
			icon: <FaGripLines />,
			color: "bg-green-400",
			thumbnail: "",
		},
		END_STEP: {
			icon: <FaGripLines />,
			color: "bg-amber-400",
			thumbnail: "",
		},
		CONTACT_INFO: {
			icon: <IoPersonOutline />,
			color: "bg-indigo-400",
			thumbnail: "/images/contactInfo.jpeg",
		},
		SINGLE_SELECT_OPTION: {
			icon: <RxDropdownMenu />,
			color: "bg-yellow-200",
			thumbnail: "/images/singleSelect.jpeg",
		},
		MULTI_SELECT_OPTION: {
			icon: <MdCheckBox />,
			color: "bg-purple-200",
			thumbnail: "/images/multiSelect.jpeg",
		},
		ADDRESS: {
			icon: <CiLocationOn />,
			color: "bg-red-400",
			thumbnail: "/images/address.jpeg",
		},
		DATE: {
			icon: <SlCalender />,
			color: "bg-violet-400",
			thumbnail: "/images/date.jpeg",
		},
		NUMBER: {
			icon: <BsHash />,
			color: "bg-violet-200",
			thumbnail: "/images/number.jpeg",
		},
		STATEMENT: {
			icon: <FaRegFileAlt />,
			color: "bg-pink-400",
			thumbnail: "/images/statement.jpeg",
		},
		URL: {
			icon: <FaLink />,
			color: "bg-teal-400",
			thumbnail: "/images/url.jpeg",
		},
		DROPDOWN: {
			icon: <RxDropdownMenu />,
			color: "bg-blue-400",
			thumbnail: "/images/dropdown.jpeg",
		},
	};
