let span = document.querySelector("span");
let btns = document.querySelectorAll("button");
// let btnArr= [...btns]
let btnsArr = Array.from(document.querySelectorAll("button"));
const DataSets = {
  profession: ["Developer.", "Writer.", "Programmer."],
  fruits: [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
    "honeydew",
    "kiwi",
    "lemon",
  ],
  colors: [
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "black",
    "white",
    "gray",
  ],
  days: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  lang: [
    "Python",
    "JavaScript",
    "Java",
    "C++",
    "Ruby",
    "Go",
    "Swift",
    "PHP",
    "Rust",
    "TypeScript",
  ],
  animals: [
    "dog",
    "cat",
    "fish",
    "bird",
    "snake",
    "horse",
    "sheep",
    "cow",
    "lion",
    "tiger",
  ],
  countries: [
    "USA",
    "Canada",
    "Mexico",
    "Brazil",
    "UK",
    "France",
    "Germany",
    "China",
    "Japan",
    "India",
  ],
  planets: [
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "Sun",
  ],
};
let currenIntevalId = null;
function autoType(arr) {
  if (currenIntevalId) {
    clearInterval(currenIntevalId);
  }
  let charIndex = 0;
  let reverseTyping = false;
  let wordIndex = 0;
  let skipUpdate = 0;
  currenIntevalId = setInterval(() => {
    if (skipUpdate) {
      skipUpdate--;
      return;
    }
    if (!reverseTyping) {
      skipUpdate = 1;
      span.innerText = span.innerText + arr[wordIndex][charIndex];

      charIndex++;
    } else {
      span.innerText = span.innerText.slice(0, span.innerText.length - 1);
      charIndex--;
    }
    if (charIndex === arr[wordIndex].length) {
      skipUpdate = 8;
      reverseTyping = true;
    }
    if (span.innerText.length === 0 && reverseTyping) {
      skipUpdate = 4;
      reverseTyping = false;
      wordIndex++;
    }

    if (wordIndex === arr.length) {
      wordIndex = 0;
    }
  }, 100);
}
// autoType(days)
btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    let inputKey = btn.value;
    let selectedArr = DataSets[inputKey];
    if (selectedArr) {
      console.log(selectedArr);
      span.innerText = "";

      autoType(selectedArr);
    } else {
      console.error("Array not found", inputKey);
    }
  });
});
