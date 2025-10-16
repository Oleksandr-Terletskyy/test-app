# Weather App

A simple Angular application that fetches current weather and 5-day forecast for cities using the OpenWeather API. Users can save favorite cities for quick access.

## Prerequisites

* Node.js >= 18
* npm >= 9
* Angular CLI >= 19

## Setup

1. Clone the repository:

git clone [https://github.com/yourusername/weather-app.git](https://github.com/yourusername/weather-app.git)
cd weather-app

2. Install dependencies:

npm install

3. Set your OpenWeather API key:
   Open `src/environments/environment.ts` and replace the openWeathermApiKey:

export const openWeathermApiKey = 'YOUR_API_KEY_HERE'

> You can get a free API key from [OpenWeather](https://openweathermap.org/api) or ask the owner of repository.

## Running the Application

Run the development server:

ng serve

Visit `http://localhost:4200/`. The app reloads automatically on changes.

## Running Tests

The project uses Karma + Jasmine.
Run all tests:

ng test

Generate a code coverage report:

ng test --code-coverage

Coverage reports are in the `coverage/` folder.

## Project Structure

* `src/app/components/` – Reusable components (WeatherTabs, SearchInput, FavoriteCities)
* `src/app/services/` – API calls and favorites management
* `src/app/models/` – TypeScript models for weather data
* `src/environments/` – Environment-specific settings (API key, production flag)

## Notes

* Replace `YOUR_API_KEY_HERE` in `environment.ts` before running the app.
* Weather and city data are cached in `localStorage` for 1 hour.
* Error handling:

  * `apiError` – API requests fail (404/500).
  * `notFound` – City query returns an empty array.
