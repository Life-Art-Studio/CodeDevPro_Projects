"use strict";

const inputStr = document.querySelector("#input");
document.getElementById("lower-case").innerText = inputStr.value.toLowerCase();
document.getElementById("upper-case").innerText = inputStr.value.toUpperCase();
document.getElementById("camel-case").innerText = toCamelCase(inputStr.value);
document.getElementById("pascal-case").innerText = toPascalCase(inputStr.value);
document.getElementById("snake-case").innerText = snakeCase(inputStr.value);
document.getElementById("kebab-case").innerText = kebabCase(inputStr.value);
document.getElementById("trim-spaces").innerText = trimCase(inputStr.value);

function capitaliseFirstLetter(str) {
  if (str === "") {
    return "".trim();
  }
  return str[0].toUpperCase() + str.slice(1, str.length);
}

function toCamelCase(str) {
  const lowerCase = str.toLowerCase();
  const wordArr = lowerCase.split(" ");
  let finalArr = wordArr.map((word, i) => {
    if (i === 0) return word;
    return capitaliseFirstLetter(word);
  });
  return finalArr.join("");
}
function toPascalCase(str) {
  const lowerCase = str.toLowerCase();
  const wordArr = lowerCase.split(" ");
  let finalArr = wordArr.map((word) => {
    return capitaliseFirstLetter(word);
  });
  return finalArr.join("");
}
function snakeCase(str) {
  const lowerCase = str.toLowerCase();
  const newArr = lowerCase.split(" ");
  const finalStr = newArr.join("_");
  return finalStr;
}
function kebabCase(str) {
  const lowerCase = str.toLowerCase();
  const newArr = lowerCase.split(" ");
  const finalStr = newArr.join("-");
  return finalStr;
}
function trimCase(str) {
  return str.replaceAll(" ", "");
}

inputStr.addEventListener("input", () => {
  document.getElementById("lower-case").innerText = inputStr.value
    .toLowerCase()
    .replace(/\s{2,}/g, " ")
    .trim();
  document.getElementById("upper-case").innerText = inputStr.value
    .toUpperCase()
    .replace(/\s{2,}/g, " ")
    .trim();
  document.getElementById("camel-case").innerText = toCamelCase(
    inputStr.value.trim().replace(/\s{2,}/g, " ")
  );
  document.getElementById("pascal-case").innerText = toPascalCase(
    inputStr.value.trim().replace(/\s{2,}/g, " ")
  );
  document.getElementById("snake-case").innerText = snakeCase(
    inputStr.value.trim().replace(/\s{2,}/g, " ")
  );
  document.getElementById("kebab-case").innerText = kebabCase(
    inputStr.value.trim().replace(/\s{2,}/g, " ")
  );
  document.getElementById("trim-spaces").innerText = trimCase(
    inputStr.value.trim().replace(/\s{2,}/g, " ")
  );
});
