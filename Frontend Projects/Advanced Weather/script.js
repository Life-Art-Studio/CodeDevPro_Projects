"use strict";
const openCloseBtn = document.getElementById("open-close");
const bottomContainer = document.querySelector(".bottom-container");
const addbtn = document.getElementById("add-btn");
const hourlyBtn = document.getElementById("hourly-btn");
const weeklyBtn = document.getElementById("weekly-btn");
const locationBtn = document.getElementById("location-btn");
const mainSearchForm = document.querySelector(".main-search-bar form");
const listBtn = document.getElementById("list-btn");
const savedPanel = document.querySelector(".saved-weather-panel");
const backBtn = document.querySelector(".back-btn");
const mainLocation = document.querySelector(".temp-location span");
const mainTemp = document.querySelector(".temp-value span");
const mainWeather = document.querySelector(".temp-weather span");
const mainTempImg = document.querySelector("#temp-img");
let apiKey = "291e5469883a1f246bc6119cc29700f5";
listBtn.addEventListener("click", () => {
  savedPanel.classList.add("show");
});
backBtn.addEventListener("click", () => {
  savedPanel.classList.remove("show");
});

document.addEventListener("click", (e) => {
  if (!mainSearchForm.contains(e.target) && !locationBtn.contains(e.target)) {
    mainSearchForm.parentElement.classList.remove("show");
    locationBtn.innerHTML = "&#128205;";
  }
});

locationBtn.addEventListener("click", () => {
  mainSearchForm.parentElement.classList.toggle("show");
  if (mainSearchForm.parentElement.classList.contains("show")) {
    locationBtn.innerHTML = "&#10006;";
  } else {
    locationBtn.innerHTML = "&#128205;";
  }
});

openCloseBtn.addEventListener("click", () => {
  bottomContainer.classList.toggle("hide");
});

hourlyBtn.addEventListener("click", () => {
  document.getElementById("hourly").style.display = "flex";
  document.getElementById("weekly").style.display = "none";
  hourlyBtn.classList.add("selected");
  weeklyBtn.classList.remove("selected");
});

weeklyBtn.addEventListener("click", () => {
  document.getElementById("hourly").style.display = "none";
  document.getElementById("weekly").style.display = "flex";
  weeklyBtn.classList.add("selected");
  hourlyBtn.classList.remove("selected");
});

// Weather Functionality///

mainSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cityInput = mainSearchForm.querySelector("input");
  const city = cityInput.value.trim();
  if (city) {
    fetchCurrentWeather(city);
    fetchForecastByLocation(city);
    cityInput.value = "";
    mainSearchForm.parentElement.classList.remove("show");
    locationBtn.innerHTML = "&#128205;";
  }
});

fetchCurrentWeather();

async function fetchCurrentWeather(city) {
  if (city) {
    let apiKey = "291e5469883a1f246bc6119cc29700f5";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    console.log(data.weather[0].main);
    //

    mainLocation.innerText = `${data.name}, ${data.sys.country}`;
    mainTemp.innerText = `${Math.round(data.main.temp)}°C`;
    mainWeather.innerText = `${data.weather[0].main}`;
  } else if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // console.log(`${lat} and ${lon}`);
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=291e5469883a1f246bc6119cc29700f5&units=metric`
        )
          .then((res) => res.json())
          .then((data) => {
            // console.log(data);
            if (data) {
              // console.log(data);
              mainLocation.innerText = `${data.name}, ${data.sys.country}`;
              mainTemp.innerText = `${Math.round(data.main.temp)}°C`;
              mainWeather.innerText = `${data.weather[0].main}`;
            }
          });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

async function fetchForecastByLocation(city) {
  if (city) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    if (data) {
      updateForecastData();

      function updateForecastData() {
        updateImg();
        function updateImg() {
          const time1Img = document.querySelector("#time-1");
          const time2Img = document.querySelector("#time-2");
          const time3Img = document.querySelector("#time-3");
          const time4Img = document.querySelector("#time-4");
          const time5Img = document.querySelector("#time-5");
          const time6Img = document.querySelector("#time-6");
          const time7Img = document.querySelector("#time-7");
          const time8Img = document.querySelector("time-8");
          if (data.list[0].weather[0].main.toLowerCase() === "clouds") {
            time1Img.src = "/assests/icon/clouds.png";
          } else if (data.list[0].weather[0].main.toLowerCase() === "clear") {
            time1Img.src = "/assests/icon/sun.png";
          }else if(data.list[0].weather[0].main.toLowerCase()==="rain"){
            time1Img.src="/assests/icon/sun-clouds-rain.png"
          }
        }

        document.getElementById("temp-9pm").innerText = `${Math.round(
          data.list[0].main.temp
        )}°C`;
        document.getElementById("hour-1").innerText = new Date(
          data.list[0].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("day-1").innerText = new Date(
          data.list[0].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        });
        document.getElementById("temp-day1").innerText = `${Math.round(
          data.list[0].main.temp
        )}°C`;
        document.getElementById("temp-12am").innerText = `${Math.round(
          data.list[1].main.temp
        )}°C`;
        document.getElementById("hour-2").innerText = new Date(
          data.list[1].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("day-2").innerText = new Date(
          data.list[8].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        });
        document.getElementById("temp-day2").innerText = `${Math.round(
          data.list[8].main.temp
        )}°C`;

        document.getElementById("temp-3am").innerText = `${Math.round(
          data.list[2].main.temp
        )}°C`;
        document.getElementById("hour-3").innerText = new Date(
          data.list[2].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("day-3").innerText = new Date(
          data.list[16].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        });
        document.getElementById("temp-day3").innerText = `${Math.round(
          data.list[16].main.temp
        )}°C`;
        document.getElementById("temp-6am").innerText = `${Math.round(
          data.list[3].main.temp
        )}°C`;
        document.getElementById("hour-4").innerText = new Date(
          data.list[3].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("day-4").innerText = new Date(
          data.list[24].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        });
        document.getElementById("temp-day4").innerText = `${Math.round(
          data.list[24].main.temp
        )}°C`;
        document.getElementById("temp-9am").innerText = `${Math.round(
          data.list[4].main.temp
        )}°C`;
        document.getElementById("hour-5").innerText = new Date(
          data.list[4].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("day-5").innerText = new Date(
          data.list[32].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        });
        document.getElementById("temp-day5").innerText = `${Math.round(
          data.list[32].main.temp
        )}°C`;
        document.getElementById("temp-12pm").innerText = `${Math.round(
          data.list[5].main.temp
        )}°C`;
        document.getElementById("hour-6").innerText = new Date(
          data.list[5].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("day-6").innerText = new Date(
          data.list[39].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        });
        document.getElementById("temp-day6").innerText = `${Math.round(
          data.list[39].main.temp
        )}°C`;
        document.getElementById("temp-3pm").innerText = `${Math.round(
          data.list[6].main.temp
        )}°C`;
        document.getElementById("hour-7").innerText = new Date(
          data.list[6].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
        document.getElementById("temp-6pm").innerText = `${Math.round(
          data.list[7].main.temp
        )}°C`;
        document.getElementById("hour-8").innerText = new Date(
          data.list[7].dt * 1000
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
        });
      }
    }
  } else if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=291e5469883a1f246bc6119cc29700f5&units=metric
`)
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            if (data) {
              // console.log(data);
              document.getElementById("temp-9pm").innerText = `${Math.round(
                data.list[0].main.temp
              )}°C`;
              document.getElementById("hour-1").innerText = new Date(
                data.list[0].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("day-1").innerText = new Date(
                data.list[0].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
              });
              document.getElementById("temp-day1").innerText = `${Math.round(
                data.list[0].main.temp
              )}°C`;
              document.getElementById("temp-12am").innerText = `${Math.round(
                data.list[1].main.temp
              )}°C`;
              document.getElementById("hour-2").innerText = new Date(
                data.list[1].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("day-2").innerText = new Date(
                data.list[8].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
              });
              document.getElementById("temp-day2").innerText = `${Math.round(
                data.list[8].main.temp
              )}°C`;

              document.getElementById("temp-3am").innerText = `${Math.round(
                data.list[2].main.temp
              )}°C`;
              document.getElementById("hour-3").innerText = new Date(
                data.list[2].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("day-3").innerText = new Date(
                data.list[16].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
              });
              document.getElementById("temp-day3").innerText = `${Math.round(
                data.list[16].main.temp
              )}°C`;
              document.getElementById("temp-6am").innerText = `${Math.round(
                data.list[3].main.temp
              )}°C`;
              document.getElementById("hour-4").innerText = new Date(
                data.list[3].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("day-4").innerText = new Date(
                data.list[24].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
              });
              document.getElementById("temp-day4").innerText = `${Math.round(
                data.list[24].main.temp
              )}°C`;
              document.getElementById("temp-9am").innerText = `${Math.round(
                data.list[4].main.temp
              )}°C`;
              document.getElementById("hour-5").innerText = new Date(
                data.list[4].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("day-5").innerText = new Date(
                data.list[32].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
              });
              document.getElementById("temp-day5").innerText = `${Math.round(
                data.list[32].main.temp
              )}°C`;
              document.getElementById("temp-12pm").innerText = `${Math.round(
                data.list[5].main.temp
              )}°C`;
              document.getElementById("hour-6").innerText = new Date(
                data.list[5].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("day-6").innerText = new Date(
                data.list[39].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
              });
              document.getElementById("temp-day6").innerText = `${Math.round(
                data.list[39].main.temp
              )}°C`;
              document.getElementById("temp-3pm").innerText = `${Math.round(
                data.list[6].main.temp
              )}°C`;
              document.getElementById("hour-7").innerText = new Date(
                data.list[6].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
              document.getElementById("temp-6pm").innerText = `${Math.round(
                data.list[7].main.temp
              )}°C`;
              document.getElementById("hour-8").innerText = new Date(
                data.list[7].dt * 1000
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
              });
            }
          });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }
}
fetchForecastByLocation();

// Saved Locations Functionality///

// 1. REUSABLE RENDER FUNCTION (global, outside any event listener)

const savedForm = document.querySelector("#saved-form");

// load from localStorage on start
let cities = JSON.parse(localStorage.getItem("cities")) || {};
let nextId = Number(localStorage.getItem("citiesNextId")) || 0;

savedForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("submitted");

  let input = e.target.querySelector('input[type="text"]');
  const cityName = input.value.toLowerCase().trim();
  const values = Object.values(cities);

  // 1) empty input
  if (!cityName) return;

  // 2) duplicate
  if (values.includes(cityName)) {
    console.log("Duplicate, not adding:", cityName);
    return;
  }
  // 3) safe to add
  cities[nextId] = cityName;

  // save BEFORE incrementing id (or use a temp variable)
  localStorage.setItem("cities", JSON.stringify(cities));
  localStorage.setItem("citiesNextId", String(nextId));

  console.log(cities);
  input.value = "";
  nextId++;
  getWeatherForSavedCity(cityName);
});

async function getWeatherForSavedCity(cityName) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
    );

    if (!res.ok) {
      console.error("Failed for city:", cityName, res.status);
      return; // do not try to create card
    }

    const data = await res.json();
    console.log("Data for", cityName, data);

    if (!data.main || !data.weather) {
      console.error("Bad data for city:", cityName, data);
      return;
    }

    createLocationCard(data);
  } catch (err) {
    console.error("Fetch error for", cityName, err);
  }
}

function createLocationCard(data) {
  const allLocations = document.querySelector(".locations");
  const location = document.createElement("div");
  location.id = "location";
  // location.dataset.id=

  const locationBg = document.createElement("div");
  locationBg.className = "card-bg";
  const locationInfo = document.createElement("div");
  locationInfo.className = "location-info";
  const locationHeading = document.createElement("h4");
  const locationTemp = document.createElement("span");
  locationTemp.id = "location-temp";
  const locationImg = document.createElement("div");
  locationImg.className = "weather-img";
  const removeBtn = document.createElement("span");
  removeBtn.className = "remove-btn";

  allLocations.appendChild(location);
  location.appendChild(locationBg);
  location.appendChild(locationInfo);
  locationInfo.appendChild(locationHeading);
  locationInfo.appendChild(locationTemp);
  locationInfo.appendChild(locationImg);
  location.appendChild(removeBtn);

  removeBtn.innerHTML = "&#10006;";
  locationTemp.innerText = `${Math.round(data.main.temp)}°C`;
  locationHeading.innerText = data.name;

  removeBtn.addEventListener("click", () => {
    const card = removeBtn.closest("#location"); // or your card selector
    card.remove();
    const keys = Object.keys(cities);
    let id = 0;
    keys.forEach((key) => {
      id = key;
    });
    console.log(id);

    removeCityAndReIndex(id);
  });
}

// remove location card function

function removeCityAndReIndex(id) {
  // 1. Load current object
  const oldCities = JSON.parse(localStorage.getItem("cities")) || {};

  // 2. Remove the requested key
  delete oldCities[id];

  // 3. Rebuild with new keys 0,1,2,...
  const newCities = {};
  let newId = 0;

  Object.values(oldCities).forEach((name) => {
    newCities[newId] = name;
    newId++;
  });

  // 4. Save back + update global and LS nextId
  localStorage.setItem("cities", JSON.stringify(newCities));
  localStorage.setItem("citiesNextId", String(newId));

  cities = newCities; // update globals if you use them outside
  nextId = newId;
}

window.addEventListener("DOMContentLoaded", () => {
  cities = JSON.parse(localStorage.getItem("cities")) || {};
  nextId = Number(localStorage.getItem("citiesNextId")) || 0;

  // console.log("Cities on load:", cities);
  Object.values(cities).forEach((cityName) => {
    // console.log(cityName);
    getWeatherForSavedCity(cityName);
  });
  // console.log("raw cities LS:", localStorage.getItem("cities"));
  // console.log("raw nextId LS:", localStorage.getItem("citiesNextId"));
});

function removeAllSavedLocations() {
  localStorage.removeItem("cities");
  localStorage.removeItem("citiesNextId");

  // reset globals if you use them
  cities = {};
  nextId = 0;
}

document.querySelector("#remove").addEventListener("click", (e) => {
  removeAllSavedLocations();
  const container = document.querySelector(".locations");
  container.innerHTML = "";
});

// const input = document.getElementById("search");
// const list = document.querySelector("#suggestions ul");

// mainSearchForm.addEventListener("input", async (e) => {
//   e.preventDefault();
//   const cityInput = mainSearchForm.querySelector("input");
//   // const city = cityInput.value.trim();
//   const query = cityInput.value;
//   if (query.length < 2) return;

//   const res = await fetch(
//     `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
//   );

//   const data = await res.json();
//   list.innerHTML = "";

//   data.forEach((city) => {
//     const li = document.createElement("li");
//     li.textContent = `${city.name}, ${city.country}`;

//     li.onclick = () => {
//       cityInput.value = city.name;
//       list.innerHTML = "";

//       if (query) {
//         fetchCurrentWeather(query);
//         fetchForecastByLocation(query);
//         cityInput.value = "";
//         mainSearchForm.parentElement.classList.remove("show");
//         locationBtn.innerHTML = "&#128205;";
//       }
//     };

//     list.appendChild(li);
//   });
// });


const list = document.querySelector("#suggestions ul");
const cityInput = mainSearchForm.querySelector("input");

let controller;

mainSearchForm.addEventListener("input", async () => {
  const query = cityInput.value.trim();

  if (query.length < 2) {
    list.innerHTML = "";
    return;
  }

  if (controller) controller.abort();
  controller = new AbortController();

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`,
      { signal: controller.signal }
    );

    const data = await res.json();

    // 🔒 SAFETY CHECK
    if (!Array.isArray(data)) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = "";

    data.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = `${city.name}, ${city.country}`;

      li.addEventListener("click", () => {
        cityInput.value = city.name;
        list.innerHTML = "";

        fetchCurrentWeather(city.name);
        fetchForecastByLocation(city.name);

        mainSearchForm.parentElement.classList.remove("show");
        locationBtn.innerHTML = "&#128205;";
      });

      list.appendChild(li);
    });
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Fetch error:", err);
    }
  }
});


