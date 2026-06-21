const input = document.querySelector("input");
let previusValue = "";
let firstThreeNumbers = "";
input.addEventListener("input", (e) => {
  let value = e.target.value;
  if (/\d+$/g.test(value)) {
    input.style.color = "black";
    if (value.length === 4 && previusValue.length < value.length) {
      firstThreeNumbers = input.value.substring(0, 3);
      input.value = `+(${firstThreeNumbers})-${input.value.substring(3, 6)}`;
    } else if (value.length === 6 && previusValue.length > value.length) {
      input.value = firstThreeNumbers;
    }
    previusValue = value;
  } else {
    input.style.color = "red";
  }
});
