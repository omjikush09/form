"use client";
import { FormElement } from "@/components/FormElements/FormElements";
import { useFormContext } from "@/context/FormContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useFormStepData } from "@/context/FormStepDataContext";
import { createDynamicFormSchema } from "@/lib/validations/dynamicFormSchema";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { AxiosError } from "axios";
import api from "@/util/axios";

function FormPage() {
	const { formId } = useParams<{ formId: string }>();
	const {
		formStepData,
		setElements,
		loading: formStepLoading,
		error: formStepError,
	} = useFormStepData();
	const {
		formData,
		fetchFormData,
		loading: formContextLoading,
		error: formContextError,
	} = useFormContext();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	// Create form schema and initialize react-hook-form only when data is loaded
	const formSchema = React.useMemo(() => {
		if (formStepData.length === 0) return null;
		return createDynamicFormSchema(formStepData);
	}, [formStepData]);

	// Create default values for all form fields
	const defaultValues = React.useMemo(() => {
		const values: Record<string, string | string[] | Record<string, unknown>> =
			{};
		formStepData.forEach((step) => {
			if (
				step.id &&
				step.type !== "START_STEP" &&
				step.type !== "END_STEP" &&
				step.type !== "STATEMENT"
			) {
				if (step.type === "MULTI_SELECT_OPTION") {
					values[step.id] = []; // Default to empty array for multi-select
				} else if (step.type === "ADDRESS" || step.type === "CONTACT_INFO") {
					values[step.id] = {}; // Default to empty object for address/contact
				} else {
					values[step.id] = ""; // Default to empty string for other types
				}
			}
		});
		return values;
	}, [formStepData]);

	const form = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues,
		mode: "onChange",
	});

	// Reset form with new default values when schema changes as in formSchema is undefined
	React.useEffect(() => {
		if (formSchema && Object.keys(defaultValues).length > 0) {
			form.reset(defaultValues);
		}
	}, [formSchema, defaultValues, form]);

	const getQuestions = async (formId: string) => {
		try {
			setElements(formId);
		} catch (error) {
			toast.error("Failed to Fetch From data. Please try again later");
		}
	};
	// Simple next step function - validation is now handled in handleButtonOnClick
	const nextStep = () => {
		const steps = formStepData.length - 1;
		if (currentStep < steps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleButtonOnClick = async () => {
		const currentStepData = formStepData.find(
			(data) => data.step === currentStep
		);

		// Skip validation for START_STEP, END_STEP, and STATEMENT
		if (
			currentStepData?.type === "START_STEP" ||
			currentStepData?.type === "END_STEP" ||
			currentStepData?.type === "STATEMENT"
		) {
			nextStep();
			return;
		}

		// Use react-hook-form validation for current field
		if (formSchema && form && currentStepData?.id) {
			// Trigger validation for the current field
			const isValid = await form.trigger(currentStepData.id);

			if (!isValid) {
				// Get field errors to show specific messages
				const fieldError = form.formState.errors[currentStepData.id];
				console.error(fieldError);
				// Handle different error structures
				if (fieldError?.message) {
					// Direct field error message
					toast.error(fieldError.message);
				} else if (fieldError && typeof fieldError === "object") {
					// Handle nested field errors (for CONTACT_INFO and ADDRESS types)
					const errorMessages: string[] = [];

					// Check for nested field errors with path structure [fieldId].value
					Object.entries(fieldError).forEach(([_, fieldErrorData]) => {
						if (
							fieldErrorData &&
							typeof fieldErrorData === "object" &&
							"value" in fieldErrorData
						) {
							// Check if it has a value property with message
							const valueError = fieldErrorData.value;
							if (valueError?.message) {
								errorMessages.push(valueError.message);
							}
						}
					});

					// Display all error messages
					if (errorMessages.length > 0) {
						errorMessages.forEach((message) => toast.error(message));
					} else {
						toast.error("Please fix the validation errors");
					}
				} else {
					toast.error("Please fix the validation errors");
				}
				return;
			}
		}

		// If this is the last question step, submit the form
		if (currentStep == formStepData.length - 2) {
			// Validate the entire form before submission
			const isFormValid = await form.trigger();

			if (!isFormValid) {
				toast.error("Please fix all validation errors before submitting");
				return;
			}
			setIsSubmitting(true);
			const formValues = form.getValues();
			console.log("Raw form data:", formValues);

			// Convert react-hook-form data to the expected API format and submit directly
			const transformedAnswers = Object.entries(formValues).map(
				([questionId, answer]) => ({
					form_question_id: questionId,
					answer: answer,
				})
			);

			console.log("Submitting data:", { answers: transformedAnswers });

			try {
				await api.post(`/form/${formId}/responses`, {
					answers: transformedAnswers,
				});

				toast.success("Form submitted successfully!");
			} catch (error) {
				if (error instanceof AxiosError) {
					const response = error.response!;

					if (response.data.error && response.data.validationErrors) {
						response.data.validationErrors.forEach((err: any) => {
							toast.error(err.field, err.message);
						});
					} else {
						toast.error("Failed to submit form");
					}
				} else {
					toast.error("Failed to submit form");
				}
				return;
			} finally {
				setIsSubmitting(false);
			}
		}

		// Move to next step
		const steps = formStepData.length - 1;
		if (currentStep < steps) {
			setCurrentStep(currentStep + 1);
		}
	};

	useEffect(() => {
		if (formId) {
			getQuestions(formId);
			fetchFormData(formId);
		}
	}, [formId]);

	useEffect(() => {
		if (currentStep == formStepData.length - 1) {
		}
	}, [currentStep]);

	const stepData = formStepData.find((data) => data.step == currentStep);

	// Show loading spinner if either form context or form step data is loading
	const isLoading = formContextLoading || formStepLoading || !formSchema;
	const hasError = formContextError || formStepError;

	if (hasError) {
		return (
			<div className="flex flex-col h-full items-center justify-center">
				<div className="text-red-500 text-xl mb-4">⚠️</div>
				<p className="text-lg text-gray-600 mb-4">Something went wrong</p>
				<p className="text-sm text-gray-500">Please try refreshing the page</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col h-full items-center justify-center">
				<Spinner className="w-8 h-8 mb-4" />
				<p className="text-lg text-gray-600">Loading form...</p>
			</div>
		);
	}

	return (
		<div
			className=" grid place-items-center h-full w-full"
			style={{
				backgroundColor: formData.settings.backgroundColor,
				fontFamily: `${formData.settings.fontFamily}, sans-serif`,
			}}
		>
			<Form {...form}>
				<div className="flex flex-col gap-2">
					{(() => {
						if (!stepData?.type) return;
						const Component = FormElement[stepData.type].FormComponet;
						return (
							<Component
								selectedStep={currentStep}
								isSubmitting={isSubmitting}
								disabled={isSubmitting}
								buttonOnClink={handleButtonOnClick}
							/>
						);
					})()}
				</div>
			</Form>
		</div>
	);
}

export default FormPage;
