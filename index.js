// DOM elements
const form = document.querySelector(".form");
const workoutContainer = document.querySelector(".workout__container");

const inputType = document.getElementById("input__type");
const inputDistance = document.getElementById("input__distance");
const inputDuration = document.getElementById("input__duration");
const inputCadence = document.getElementById("input__cadence");
const inputElevationGain = document.getElementById("input__elevation-gain");

// making class architecture

const d = new Date();
const date = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
console.log(date);

//! classes for data manipulation
class Workout {
  date = date;
  id = "id" + new Date().getTime();
  constructor(cords, distance, duration) {
    console.log(date);
    this.cords = cords; //[lat,lng]
    this.distance = distance; //km
    this.duration = duration; //min
  }
}

class Running extends Workout {
  type = "running";
  constructor(cords, distance, duration, cadence) {
    super(cords, distance, duration);
    this.cadence = cadence;
    this.clcPace();
  }
  clcPace() {
    // min/km
    this.pace = Math.floor(this.duration / this.distance);
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    // km/h
    this.speed = Math.floor(this.distance / this.duration);
  }
}

//! main app class for whole global code APPLICATION
class App {
  // private variables goes here
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // the code here run immediately
    this._getPosition();
    // listening on form submission
    form.addEventListener("submit", this._newWorkout.bind(this));
    // input type change eventHandler will make cadence or elevation gain toggle hidden class
    inputType.addEventListener("change", this._toggleElevationField);
  }

  // necessary functions _convention stands for private
  _getPosition() {
    // if the navigator exist in browsers then only execute
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };
      // getting location
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("permission denied");
        },
        options
      );
    }
  }

  _loadMap(position) {
    // extracting lat and lng from position parameter
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cords = [latitude, longitude];
    // open street map imported and using L from it and make it as global variable
    this.#map = L.map("map").setView(cords, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // adding a event handler on map on() method
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapEvnt) {
    // making mapEvent as global to access in form submission
    this.#mapEvent = mapEvnt;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _newWorkout(e) {
    e.preventDefault();
    // validation handler
    const validation = (...inputs) =>
      inputs.every((input) => Number.isFinite(input));
    const allPositive = (...inputs) => inputs.every((input) => input > 0);
    // get the form data
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // if running create running object
    if (type === "running") {
      const cadence = +inputCadence.value;
      // check the data is valid
      if (
        !validation(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert("1give a valid input");
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if cycling create cycling object
    if (type === "cycling") {
      const elevation = +inputElevationGain.value;
      if (
        !validation(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert("2not a valid input");
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // add to workout array
    this.#workouts.push(workout);
    console.log(workout);

    // render the workout as map marker
    this._renderWorkoutMarker(workout);

    // render the workout on list
    this._renderWorkout(workout);

    // hide form and clearing form
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevationGain.value =
        "";
  }

  _renderWorkoutMarker(workout) {
    const [lat, lng] = workout.cords;
    let popup = L.popup([lat, lng], {
      content: `<p>${workout.type}</p>`,
      autoClose: false,
      closeOnClick: false,
      maxWidth: 250,
      minWidth: 100,
      className: `${workout.type}-popup`,
    }).openOn(this.#map);
    L.marker([lat, lng]).addTo(this.#map).bindPopup(popup).openPopup();
  }

  _toggleElevationField() {
    // toggle elvGain for cycling and cadence for running
    inputCadence.closest(".row-workout").classList.toggle("form__row--hidden");
    inputElevationGain
      .closest(".row-workout")
      .classList.toggle("form__row--hidden");
  }

  _renderWorkout(workout) {
    const html = `<div class="single-workout__container ${workout.type}-popup">
              <h3 class="single-workout__headline">${workout.type} on ${
      workout.date
    }</h3>
              <div class="single-workout__description">
                <span>🏃${workout.distance} Km</span> 
                <span>⌛${workout.duration} Min</span> 
                <span>⚡${
                  workout.type == "running" ? workout.pace : workout.speed
                }km/hr</span>
                <span>👣2SPM</span>
            </div>
          </div>`;
    workoutContainer.insertAdjacentHTML("afterbegin", html);
  }
}

const app = new App();
