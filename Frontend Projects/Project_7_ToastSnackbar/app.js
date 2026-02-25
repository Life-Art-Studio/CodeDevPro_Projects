let toast1 = document.querySelector("#toast-1 span");
let toast2 = document.querySelector("#toast-2 span");
let toast3 = document.querySelector("#toast-3 span");
let toast4 = document.querySelector("#toast-4 span");
let inputValue = document.querySelector("#user-input")
const showBtn = document.querySelector(".show");
const type = document.querySelector("#type");
let positionX = document.querySelector("#position-x");
let positionY = document.querySelector("#position-y");
const form=document.querySelector("#form")

form.addEventListener("submit", (e) => {
  e.preventDefault();
  toast1.innerText = inputValue.value;
  toast2.innerText = inputValue.value;
  toast3.innerText = inputValue.value;
  toast4.innerText = inputValue.value;
 
  if (positionX.value === "right" && positionY.value === "top") {
    toast1.parentElement.classList.add("active");
    toast2.parentElement.classList.remove("active");
    toast3.parentElement.classList.remove("active");
    toast4.parentElement.classList.remove("active");
  }
});
