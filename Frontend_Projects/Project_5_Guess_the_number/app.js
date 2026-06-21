"use strict"
function game(){
    const form = document.getElementById("form");
const userNum = document.getElementById("input");
const submitBtn = document.getElementById("submit");
const restart = document.getElementById("new-game");
const result = document.querySelector("#result-box span");
let allGuesses = [];
const yoursGuessList = document.getElementById("all-guess");

let computerNum = Math.round(Math.random() * 100);
// console.log(computerNum);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let userInputValue = parseInt(userNum.value);
  if (allGuesses.length === 9) {
    result.innerText = "Better Luck Next Time";
    submitBtn.disabled = true;
    userNum.disabled = true;
    
  } else {
    if (userInputValue > computerNum) {
      result.innerText = "Too High";
    } else if (userInputValue < computerNum) {
      result.innerText = "Too low";
    } else if (userInputValue === computerNum) {
      result.innerText = "Congrats";
      userNum.disabled = true;
      submitBtn.disabled = true;
      restart.removeAttribute("disabled");
    }
    
  }

  form.reset();
  allGuesses.push(userInputValue);
  yoursGuessList.innerText = `Your Guesses : ${allGuesses.join(", ")}`;
});
restart.addEventListener("click", () => {
   computerNum = Math.round(Math.random() * 100);
  userNum.removeAttribute("disabled");
  submitBtn.removeAttribute("disabled");
  allGuesses = [];
  yoursGuessList.innerText = "Your Guesses :";
  console.log(computerNum);
  result.innerText = "";
});


}
game()