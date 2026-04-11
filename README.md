# Weather

A single-page weather dashboard built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no API key required.

## Features

- **Current conditions** — temperature, weather description, animated SVG icon, and wind speed with compass
- **5-day forecast** — daily high/low temperatures and weather icons
- **Temperature chart** — smooth line chart of forecast highs and lows with hover tooltips
- **°C / °F toggle** — instant conversion, preference saved across sessions
- **Weather-reactive background** — background gradient shifts to match current conditions
- **Smart city search** — disambiguates places with identical names using comma-separated qualifiers

## Search syntax

| Input | Returns |
|---|---|
| `London` | London, England, United Kingdom (most populous match) |
| `London, ON` | London, Ontario, Canada |
| `London, Canada` | London, Ontario, Canada |
| `Mérida, Spain` | Mérida, Extremadura, Spain |
| `Springfield, IL` | Springfield, Illinois, United States |
| `Sydney, NSW` | Sydney, New South Wales, Australia |

Qualifiers can be a country name, ISO country code, or standard abbreviation for provinces (Canada), states (US, Australia), Länder (Germany), or cantons (Switzerland).

If a place exists only as a neighbourhood or borough within a larger city — and therefore lacks its own entry in the underlying database — the app returns "City not found" and suggests searching for a nearby city instead.

## Data source

Weather data is provided by [Open-Meteo](https://open-meteo.com/) (free, no API key needed). Location data is sourced from [GeoNames](https://www.geonames.org/), ranked by population.

## Running locally

```bash
cd Weather
python3 -m http.server 3000
```

Then open `http://localhost:3000` in a browser.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Layout, theming, animations |
| `script.js` | API calls, rendering, chart, search logic |
