const searchInput = document.querySelector(".input-city");
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log(`Latitude: ${lat}, Longitude: ${lon}`);

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=291e5469883a1f246bc6119cc29700f5&units=metric
`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          document.getElementById("main-temp").innerHTML = `${Math.round(
            data.main.temp
          )}\xB0C`;
          document.getElementById("feels-like").innerHTML = `${Math.round(
            data.main.feels_like
          )}\xB0C`;
          document.getElementById(
            "pressure"
          ).innerHTML = `${data.main.pressure}"`;
          document.getElementById(
            "visibility"
          ).innerHTML = `${data.visibility}m`;
          document.getElementById(
            "wind-speed"
          ).innerHTML = `${data.wind.speed}meter/Sec`;
          document.getElementById(
            "humidity"
          ).innerHTML = `${data.main.humidity}%`;
          document.getElementById("temp-min-max").innerHTML=`${data.main.temp_min}/${data.main.temp_max}`
          document.getElementById("city-name").innerHTML = data.name;
          document.getElementById("description").innerHTML =
            data.weather[0].description;
        });
    },
    (error) => {
      console.error("Error getting location:", error);
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    let city = searchInput.value;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=291e5469883a1f246bc6119cc29700f5&units=metric`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        document.getElementById("main-temp").innerHTML = `${Math.round(
          data.main.temp
        )}\xB0C`;
        document.getElementById("feels-like").innerHTML = `${Math.round(
          data.main.feels_like
        )}\xB0C`;
        document.getElementById(
          "pressure"
        ).innerHTML = `${data.main.pressure}"`;
        document.getElementById("visibility").innerHTML = `${data.visibility}m`;
        document.getElementById(
          "humidity"
        ).innerHTML = `${data.main.humidity}%`;
        document.getElementById("city-name").innerHTML = data.name;
        document.getElementById("description").innerHTML =
          data.weather[0].description;
      });
  }
});
