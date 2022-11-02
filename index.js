const form = document.querySelector(".form");
const inputDistance = document.querySelector(".input__distance");
//getting geolocation
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};
let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      const cords = [latitude, longitude];

      map = L.map("map").setView(cords, 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (mapEvt) {
        mapEvent = mapEvt;
        form.classList.remove("hidden");
        inputDistance.focus();
      });
    },
    function () {
      console.log("permission denied");
    },
    options
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log(e);
  const { lat, lng } = mapEvent.latlng;
  let popup = L.popup([lat, lng], {
    content: "<p>hi</p>",
    autoClose: false,
    closeOnClick: false,
    maxWidth: 250,
    minWidth: 100,
    className: "running-popup",
  }).openOn(map);
  L.marker([lat, lng]).addTo(map).bindPopup(popup).openPopup();
});
