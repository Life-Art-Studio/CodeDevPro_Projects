import { formState, updateValue } from "./state.js";


export function renderStep(step, formEl) {
  formEl.innerHTML = `

    ${step.fields
      .map(
        (field) => `
      <input
        name="${field.name}"
        value="${formState.values[field.name] ?? ""}"
        placeholder="${field.placeholder}"
        required="${field.required}"
        type="${field.type}"
        validation="${field.validation}"
        label="${field.label}"
      />
    `,
      )
      .join("")}
 `;
}

export function navBtns(formEl) {
  const span =document.createElement("span")
  span.textContent="Next"
  const span2 =document.createElement("span")
  span2.textContent="Previous"
  const span3 =document.createElement("span")
  span3.textContent="Submit"
  const navBtns = document.createElement("div");
  navBtns.classList.add("nav-btns");
  const prevBtn = document.createElement("button");
  prevBtn.appendChild(span2)
  prevBtn.id = "prevBtn";
  prevBtn.type = "button";
  const submitBtn = document.createElement("button");
  submitBtn.appendChild(span3)
  submitBtn.id = "submitBtn";
  submitBtn.type = "button";
  const nextBtn = document.createElement("button");
  nextBtn.appendChild(span)
  nextBtn.id = "nextBtn";
  nextBtn.type = "button";
  navBtns.append(prevBtn, submitBtn, nextBtn);
  formEl.appendChild(navBtns);
}


