import { schema } from "./core/schema.js";
import { renderStep, navBtns } from "./core/renderer.js";
import { visibility, formState } from "./core/state.js";
import { validateStep } from "./validation/validators.js";
import { initState } from "./core/state.js";
const backToHomeBtn = document.getElementById("backToHomeBtn");

if (backToHomeBtn) {
  backToHomeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

const formEl = document.getElementById("form");
const formTitle = document.getElementById("form-title");

formTitle.innerText = schema.steps[formState.currentStep].name;
renderStep(schema.steps[formState.currentStep], formEl);

navBtns(formEl);
visibility(formState.currentStep);

formEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  e.preventDefault();

  let direction = null;

  if (btn.id === "nextBtn") {
    const step = schema.steps[formState.currentStep];
    if (!validateStep(step))
      return alert("Please fill all the required fields");
    formState.currentStep++;
    direction = "next";
  }

  if (btn.id === "prevBtn") {
    if (formState.currentStep <= 0) return;
    formState.currentStep--;
    direction = "prev";
  }
  if (e.target.id === "submitBtn") {
    console.log("FORM DATA:", formState.values);
  }

  const step = schema.steps[formState.currentStep];
  formTitle.innerText = step.name;

  // Animation Handling
  formEl.classList.remove("slide-in-right", "slide-in-left");
  void formEl.offsetWidth; // Force reflow to restart animation

  if (direction === "next") {
    formEl.classList.add("slide-in-right");
  } else if (direction === "prev") {
    formEl.classList.add("slide-in-left");
  }

  renderStep(step, formEl);
  navBtns(formEl);
  visibility(formState.currentStep);
});

// 3D Parallax Effect
document.addEventListener("mousemove", (e) => {
  const app = document.getElementById("app");
  if (!app) return;

  // Calculate rotation based on mouse position
  // 30 is the sensitivity divider (higher = less movement)
  const x = (window.innerWidth / 2 - e.pageX) / 30;
  const y = (window.innerHeight / 2 - e.pageY) / 30;

  app.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

formEl.addEventListener("input", (e) => {
  const field = e.target.name;
  if (!field) return;

  formState.values[field] = e.target.value;
  formState.touched[field] = true;
});

initState();
