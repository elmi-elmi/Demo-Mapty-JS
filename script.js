"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

/*========================================================================================
                                         WORKOUT
==========================================================================================*/
class Workout {
  #id = Date.now();
  #date = months[new Date().getMonth()] + " " + new Date().getDate();

  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }

  _setDescription() {
    this.description = this.type + " on " + this.#date;
  }
}

/*========================================================================================
                                         RUNNING
==========================================================================================*/
class Running extends Workout {
  type = "running";
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.pace = this.#calcPace()
    this._setDescription();
  }

  #calcPace() {
    return (this.duration / this.distance).toFixed(1);
  }
}

/*========================================================================================
                                         CYCLING
==========================================================================================*/
class Cycling extends Workout {
  #speed;
  type = "cycling";
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.speed = this.#calcSpeed()
    this._setDescription();
  }

  #calcSpeed() {
    return (this.duration/this.distance).toFixed(1);
  }
}

const c1 = new Cycling(1, 1, 1, 1);
const r1 = new Running(1, 1, 1, 1);

/*========================================================================================
                                           App
==========================================================================================*/
class App {
  #map;
  #mapEvent;

  constructor() {
    this.#getPosition();
    form.addEventListener("submit", this.#newWorkout.bind(this));
    inputType.addEventListener("change", this.#toggleElevationField);
  }

  #getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this),
        function () {
          console.log("Could not get you Location");
        }
      );
    }
  }

  #loadMap(position) {
    const { latitude, longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this.#showForm.bind(this));
  }

  #showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  #toggleElevationField(e) {
    e.preventDefault();
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  #newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;

    const allAreNumber = (...inputs) =>
      inputs.every((input) => isFinite(input));
    const allArePositive = (...inputs) => inputs.every((input) => input > 0);

    const type = inputType.value;
    let workout;
    if (type === "running") {
      const distance = +inputDistance.value;
      const duration = +inputDuration.value;
      const cadence = +inputCadence.value;

      // guard cond.
      if (
        !allAreNumber(distance, duration, cadence) ||
        !allArePositive(distance, duration, cadence)
      )
        return alert("Something Wrong Master!");

      workout = new Running(distance, duration, [lat, lng], cadence);
    }

    if (type === "cycling") {
      const distance = +inputDistance.value;
      const duration = +inputDuration.value;
      const elevationGain = +inputElevation.value;

      // guard cond.
      if (
        !allAreNumber(distance, duration, elevationGain) ||
        !allArePositive(distance, duration)
      )
        return alert("Something Wrong Master!");

      workout = new Cycling(duration, duration, [lat, lng], elevationGain);
    }

    this.#renderWorkout(workout)

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.description)
      .openPopup();

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
  }
  #renderWorkout(workout){
    const html = `
    <li class="workout workout--running" data-id="1234567890">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type==='running'?'🏃‍♂':'🚴️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.type==='running'?workout.pace:workout.speed}</span>
            <span class="workout__unit">${workout.type==='running'?'min/km':'km/h'}</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${workout.type==='running'?'🦶🏼':'⛰'}</span>
            <span class="workout__value">${workout.type==='running'?workout.cadence:workout.elevationGain}</span>
            <span class="workout__unit">${workout.type==='running'?'spm':'m'}</span>
          </div>
        </li>`



    containerWorkouts.insertAdjacentHTML('beforeend',html)
  }
}

const app = new App();
