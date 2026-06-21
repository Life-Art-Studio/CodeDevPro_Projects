const counter = document.querySelector("#counter h1");
const minusBtn = document.getElementById("minus-btn");
const addBtn = document.getElementById("add-btn");
const inputCounter = document.getElementById("input-counter");
const reset = document.getElementById("reset");

addBtn.addEventListener("click", () => {
  let countValue = parseInt(counter.innerText);
  let inputValue = parseInt(inputCounter.value);

  counter.innerText = countValue + inputValue;
});
minusBtn.addEventListener("click", () => {
  let countValue = parseInt(counter.innerText);
  if (countValue > 0) {
    let inputValue = parseInt(inputCounter.value);

    counter.innerText = countValue - inputValue;
  } else {
    countValue = 0;
  }
});
reset.addEventListener("click", () => {
  counter.innerText = "0";
  inputCounter.value = 1;
});
