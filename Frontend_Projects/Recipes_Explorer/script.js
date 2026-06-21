let input = document.querySelector("#searchInput");
let recipeContainer = document.querySelector("#recipeContainer");

let api = `https://dummyjson.com/recipes/search?q=`;
let allData;

async function getData(api) {
  try {
    let response = await fetch(api);
    if (!response.ok) return;

    let data = await response.json();

    allData = data.recipes;
    recipeContainer.innerHTML = "";
    recipeContainer.appendChild(renderRecipes(allData));
  } catch (error) {
    console.log(error);
  }
}
getData(api);

function renderRecipes(recipeArray) {
  // 1. Create your wheelbarrow
  let frag = document.createDocumentFragment();

  // 2. Loop through the array
  recipeArray.forEach((recipe) => {
    // --- BUILD THE CARD ---
    let card = document.createElement("div");
    card.classList.add("recipe-card"); // Add the CSS class I provided!

    // Option 1: The innerHTML way (Clean and fast)
    card.innerHTML = `
    <img src="${recipe.image}">
      <h3>${recipe.name}</h3>
      <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
      <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
    `;

    // --- PUT CARD IN WHEELBARROW ---
    frag.appendChild(card);
  });

  // 3. Return the finished wheelbarrow
  return frag;
}
let debounceTimer;
input.addEventListener("input", function (e) {
  clearTimeout(debounceTimer);
  let searchTerm = e.target.value.toLowerCase();

  debounceTimer = setTimeout(() => {
    let searchApi = `https://dummyjson.com/recipes/search?q=${searchTerm}`;
    recipeContainer.innerHTML = "";
    getData(searchApi);
  }, 300);
});
