import { formState } from "../core/state.js";

export function validateStep(step) {
  formState.errors = {};

  step.fields.forEach(field => {
    if (field.required && !formState.values[field.name]) {
      formState.errors[field.name] = "Required";
    }
  });

  return Object.keys(formState.errors).length === 0;
}
