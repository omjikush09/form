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
export const FormDefaultData: Record<
	AddElementFromType,
	{
		required?: boolean;
		title: string;
		description: string;
		type: FormElementTypes;
		buttonText: string;
		data?: any;
	}
> = {
	SHORT_TEXT: {
		required: false,
		title: "Enter the title",
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
		description: "Description",
		data: {
			placeholder: "Your answer",
		},
		type: "LONG_TEXT",
		buttonText: "Next",
	},
	NUMBER: {
		required: false,
		title: "Pick a Number",
		description: "Enter a number",
		type: "NUMBER",
		data: {
			placeholder: "Pick a Number",
		},
		buttonText: "Next",
	},
	URL: {
		required: false,
		title: "Enter a Website URL",
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
		},
	},
	DATE: {
		required: false,
		title: "Pick a Date",
		description: "Date",
		type: "DATE",
		data: {
			placeholder: "Pick a date",
		},
		buttonText: "Next",
	},
	STATEMENT: {
		required: false,
		title: "Enter your title",
		description: "",
		type: "STATEMENT",
		buttonText: "Next",
	},

	SINGLE_SELECT_OPTION: {
		required: false,
		title: "Please select an option",
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
		},
	},
	MULTI_SELECT_OPTION: {
		required: false,
		title: "Please select options",
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
		},
	},
	CONTACT_INFO: {
		title: "Could you share a bit about yourself?",
		description: "About yourself",
		type: "CONTACT_INFO",
		buttonText: "Next",
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
}

export const ElementDefaultData: Record<FormElementTypes, ElementDataDefaults> =
	{
		SHORT_TEXT: {
			icon: <FaGripLines />,
			color: "bg-blue-300",
		},
		LONG_TEXT: {
			icon: <FaGripLines />,
			color: "bg-red-400",
		},
		START_STEP: {
			icon: <FaGripLines />,
			color: "bg-green-400",
		},
		END_STEP: {
			icon: <FaGripLines />,
			color: "bg-amber-400",
		},
		CONTACT_INFO: {
			icon: <IoPersonOutline />,
			color: "bg-indigo-400",
		},
		SINGLE_SELECT_OPTION: {
			icon: <RxDropdownMenu />,
			color: "bg-yellow-200",
		},
		MULTI_SELECT_OPTION: {
			icon: <MdCheckBox />,
			color: "bg-purple-200",
		},
		ADDRESS: {
			icon: <CiLocationOn />,
			color: "bg-red-400",
		},
		DATE: {
			icon: <SlCalender />,
			color: "bg-violet-400",
		},
		NUMBER: {
			icon: <BsHash />,
			color: "bg-violet-200",
		},
		STATEMENT: {
			icon: <FaRegFileAlt />,
			color: "bg-pink-400",
		},
		URL: {
			icon: <FaLink />,
			color: "bg-teal-400",
		},
		DROPDOWN: {
			icon: <RxDropdownMenu />,
			color: "bg-blue-400",
		},
	};
