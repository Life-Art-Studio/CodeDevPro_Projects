import { schema } from "./schema.js";

export const formState = {
  values: {}, // { fieldName: value }
  touched: {}, // { fieldName: boolean }
  errors: {}, // { fieldName: errorMessage }
  currentStep: 0,
};

export function initState() {
  schema.steps.forEach((step) => {
    step.fields.forEach((field) => {
      formState.values[field.name] = "";
      formState.touched[field.name] = false;
      formState.errors[field.name] = null;
    });
  });
}

export function updateValue(name, value) {
  formState.values[name] = value;
  formState.touched[name] = true;
}

export function visibility(currentStep) {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const lastStep = schema.steps.length - 1;

  // RESET FIRST (this fixes ghost visibility bugs)
  prevBtn.disabled = false;
  prevBtn.style.cursor = "pointer";
  prevBtn.style.backgroundColor = "var(--primary-color)";
  nextBtn.style.display = "block";
  submitBtn.style.display = "none";

  // FIRST STEP
  if (currentStep === 0) {
    prevBtn.disabled = true;
    prevBtn.style.cursor = "not-allowed";
    prevBtn.style.backgroundColor = "grey";
  }

  // LAST STEP
  if (currentStep === lastStep) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
  }
}
