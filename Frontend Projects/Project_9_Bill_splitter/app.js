const inputBill = document.getElementById("input-bill");
const definedTipList = document.querySelector(".defined");
const customTipInput = document.getElementById("custom-tip");
const numberOfPeople = document.getElementById("people");
const tipAmount = document.getElementById("tip-amount");
const billBtn = document.getElementById("bill-btn");
const eachBill = document.getElementById("each-bill");
const total = document.getElementById("total");
const rupeeSymbol = "\u20B9";
const reset = document.getElementById("reset");

let tipValue;

billBtn.addEventListener("click", () => {
  let bill = parseInt(inputBill.value);
  let noOfPerson = parseInt(numberOfPeople.value);

  let customTip = parseInt((tipValue / 100) * bill);
  let eachPersonBill = (bill + customTip) / noOfPerson;
  eachBill.innerText = `${rupeeSymbol} ${Math.ceil(eachPersonBill)}`;
  total.innerText = `${rupeeSymbol}${bill + Math.ceil(customTip)}`;
  tipAmount.innerText = `${rupeeSymbol}${Math.ceil(customTip)}`;
  inputBill.value = "";
  [...definedTipList.children].forEach((el) => {
    el.classList.remove("selected");
  });
  customTipInput.value = "";
  numberOfPeople.value = "";
});
definedTipList.addEventListener("click", (e) => {
  [...definedTipList.children].forEach((el) => {
    el.classList.remove("selected");
  });
  if (e.target !== definedTipList) {
    e.target.classList.add("selected");
    customTipInput.value = "";
    tipValue = parseInt(e.target.innerText);
  }
});

customTipInput.addEventListener("input", () => {
  tipValue = parseInt(customTipInput.value);
  [...definedTipList.children].forEach((el) => {
    el.classList.remove("selected");
  });
});
reset.addEventListener("click", () => {
  eachBill.innerText = `${rupeeSymbol}`;
  total.innerText = `${rupeeSymbol}`;
  tipAmount.innerText = `${rupeeSymbol}`;
  inputBill.value = "";
  [...definedTipList.children].forEach((el) => {
    el.classList.remove("selected");
  });
  customTipInput.value = "";
  numberOfPeople.value = "";
});
