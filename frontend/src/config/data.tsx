import { FaGripLines } from "react-icons/fa6";
import { IoPersonOutline } from "react-icons/io5";

export type FormElementTypes =
	| "SHORT_TEXT"
	| "LONG_TEXT"
	| "START_STEP"
	| "END_STEP"
	| "CONTACT_INFO";

export type AddElementFromType = "SHORT_TEXT" | "LONG_TEXT" | "CONTACT_INFO"; // Type that can be added as block
export const FormDefaultData: Record<
	AddElementFromType,
	{
		required?: boolean;
		title: string;
		description: string;
		type: FormElementTypes;
		data?: any;
	}
> = {
	SHORT_TEXT: {
		required: false,
		title: "Enter the title",
		description: "Description",
		type: "SHORT_TEXT",
	},
	LONG_TEXT: {
		required: false,
		title: "Enter the title for long text",
		description: "Description",
		type: "LONG_TEXT",
	},
	CONTACT_INFO: {
		title: "Could you share a bit about yourself?",
		description: "About yourself",
		type: "CONTACT_INFO",
		data: {
			fields: [
				{
					id: "first_name",
					title: "First Name",
					placeholder: "Your first name",
					type: "text",
					required: true,
					display: true,
				},
				{
					id: "last_name",
					title: "Last Name",
					placeholder: "Your last name",
					type: "text",
					required: true,
					display: true,
				},
				{
					id: "email",
					title: "Email",
					placeholder: "your.email@example.com",
					type: "email",
					required: true,
					display: true,
				},
				{
					id: "phone_number",
					title: "Phone Number",
					placeholder: "+1 (555) 123-4567",
					type: "number",
					required: false,
					display: true,
				}
			],
		},
	},
};

// export type ElementDataTypes<T extends FormElementTypes> = FormData[T];

export const formTypes: AddElementFromType[] = [
	"SHORT_TEXT",
	"LONG_TEXT",
	"CONTACT_INFO",
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
	};
