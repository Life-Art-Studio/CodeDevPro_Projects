const apiUrl = `https://meme-api.com/gimme`;
const btn = document.getElementById("generate");
const title = document.getElementById("title");
const author = document.getElementById("author");
const memeContainer = document.querySelector(".meme");

async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Http erroe : ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(`Error fetching data;${error}`);
  }
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  title.innerText = `Loading...`;
  author.innerText = "";
  const data = await fetchData(apiUrl);

  if (data && data.url) {
    memeContainer.innerHTML = "";

    let img = document.createElement("img");
    img.src = data.url;
    img.alt = data.title;
    img.onerror = () => {
      console.log(`image load failed ${data.url}`);
      title.innerText = "Image failed to load";
      btn.disabled = false;
    };
    img.onload = () => {
      title.innerText = data.title;
      author.innerText = data.author;
      btn.disabled = false;
    };
    memeContainer.appendChild(img);
  } else if (data === null) {
    btn.disabled = false;
  }
});
