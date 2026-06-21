const currentDisplay = document.querySelector(".current");
const historyDisplay = document.querySelector(".history");
const buttons = document.querySelectorAll(".buttons button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("clear")) {
      currentDisplay.textContent = "";
    //   historyDisplay.textContent = "";
    }
    if (button.classList.contains("delete")) {
      currentDisplay.textContent = currentDisplay.textContent.slice(0, -1);
    }
    if (button.classList.contains("equals")) {
      currentDisplay.textContent = eval(currentDisplay.textContent);
      historyDisplay.textContent = currentDisplay.textContent;
    }
    if (
      button.classList.contains("number") ||
      button.classList.contains("operator")
    ) {
      console.log(button.dataset.value);
      currentDisplay.textContent += button.dataset.value;
    }
  });
});
