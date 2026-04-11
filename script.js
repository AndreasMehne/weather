const form = document.getElementById('search-form');
const input = document.getElementById('city-input');
const results = document.getElementById('weather-results');
const btnC = document.getElementById('btn-c');
const btnF = document.getElementById('btn-f');
const submitBtn = form.querySelector('button[type="submit"]');
const searchHint = document.getElementById('search-hint');

// WMO weather code → description + emoji
const weatherCodes = {
  0:  ['Clear Sky', '☀️'],
  1:  ['Mainly Clear', '🌤️'],
  2:  ['Partly Cloudy', '⛅'],
  3:  ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Icy Fog', '🌫️'],
  51: ['Light Drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy Drizzle', '🌧️'],
  61: ['Light Rain', '🌧️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy Rain', '🌧️'],
  71: ['Light Snow', '🌨️'],
  73: ['Snow', '❄️'],
  75: ['Heavy Snow', '❄️'],
  80: ['Rain Showers', '🌦️'],
  81: ['Rain Showers', '🌧️'],
  82: ['Violent Showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm', '⛈️'],
  99: ['Severe Thunderstorm', '⛈️'],
};

// ── Geocoding qualifier tables ───────────────────────────────

// Lowercase country name / common alias → ISO 3166-1 alpha-2
const COUNTRY_NAMES = {
  'afghanistan':'AF','albania':'AL','algeria':'DZ','angola':'AO',
  'argentina':'AR','australia':'AU','austria':'AT','azerbaijan':'AZ',
  'bangladesh':'BD','belarus':'BY','belgium':'BE','bolivia':'BO',
  'bosnia':'BA','bosnia and herzegovina':'BA','botswana':'BW',
  'brazil':'BR','brasil':'BR','bulgaria':'BG','cambodia':'KH',
  'cameroon':'CM','canada':'CA','chile':'CL','china':'CN',
  'colombia':'CO','costa rica':'CR','croatia':'HR',
  'cuba':'CU','czech republic':'CZ','czechia':'CZ','denmark':'DK',
  'dominican republic':'DO','ecuador':'EC','egypt':'EG',
  'el salvador':'SV','ethiopia':'ET','finland':'FI','france':'FR',
  'georgia':'GE','germany':'DE','deutschland':'DE','ghana':'GH',
  'greece':'GR','guatemala':'GT','honduras':'HN','hungary':'HU',
  'india':'IN','indonesia':'ID','iran':'IR','iraq':'IQ',
  'ireland':'IE','israel':'IL','italy':'IT','italia':'IT',
  'japan':'JP','jordan':'JO','kazakhstan':'KZ','kenya':'KE',
  'kuwait':'KW','laos':'LA','latvia':'LV','lebanon':'LB',
  'libya':'LY','lithuania':'LT','malaysia':'MY','mali':'ML',
  'mexico':'MX','méxico':'MX','moldova':'MD','mongolia':'MN',
  'morocco':'MA','mozambique':'MZ','myanmar':'MM','namibia':'NA',
  'nepal':'NP','netherlands':'NL','holland':'NL','new zealand':'NZ',
  'nicaragua':'NI','niger':'NE','nigeria':'NG','north korea':'KP',
  'norway':'NO','oman':'OM','pakistan':'PK','panama':'PA',
  'paraguay':'PY','peru':'PE','philippines':'PH','poland':'PL',
  'portugal':'PT','qatar':'QA','romania':'RO','russia':'RU',
  'rwanda':'RW','saudi arabia':'SA','senegal':'SN','serbia':'RS',
  'slovakia':'SK','somalia':'SO','south africa':'ZA',
  'south korea':'KR','korea':'KR','spain':'ES','españa':'ES',
  'sri lanka':'LK','sudan':'SD','sweden':'SE','switzerland':'CH',
  'schweiz':'CH','suisse':'CH','svizzera':'CH',
  'syria':'SY','taiwan':'TW','tajikistan':'TJ','tanzania':'TZ',
  'thailand':'TH','tunisia':'TN','turkey':'TR','türkiye':'TR',
  'turkmenistan':'TM','uganda':'UG','ukraine':'UA',
  'united arab emirates':'AE','uae':'AE',
  'united kingdom':'GB','uk':'GB','great britain':'GB',
  'england':'GB','scotland':'GB','wales':'GB',
  'united states':'US','united states of america':'US','usa':'US','america':'US',
  'uruguay':'UY','uzbekistan':'UZ','venezuela':'VE',
  'vietnam':'VN','viet nam':'VN','yemen':'YE','zambia':'ZM','zimbabwe':'ZW',
};

// Uppercase abbreviation → { admin1: GeoNames English name, cc: ISO country code }
// Conflicts noted inline; highest-frequency usage takes priority.
const ADMIN1_ABBREVS = {
  // ── Canadian provinces & territories (13) ──────────────────
  'AB': { admin1:'Alberta',                   cc:'CA' },
  'BC': { admin1:'British Columbia',          cc:'CA' },
  'MB': { admin1:'Manitoba',                  cc:'CA' },
  'NB': { admin1:'New Brunswick',             cc:'CA' },
  'NL': { admin1:'Newfoundland and Labrador', cc:'CA' }, // ISO NL = Netherlands; typed out preferred
  'NS': { admin1:'Nova Scotia',               cc:'CA' },
  'NT': { admin1:'Northwest Territories',     cc:'CA' }, // AU Northern Territory: type full name
  'NU': { admin1:'Nunavut',                   cc:'CA' },
  'ON': { admin1:'Ontario',                   cc:'CA' },
  'PE': { admin1:'Prince Edward Island',      cc:'CA' },
  'QC': { admin1:'Quebec',                    cc:'CA' },
  'SK': { admin1:'Saskatchewan',              cc:'CA' },
  'YT': { admin1:'Yukon',                     cc:'CA' },
  // ── US states + DC (51) ────────────────────────────────────
  // Where a code also exists as an ISO country alpha-2, US state wins
  // (e.g. CA=California not Canada, DE=Delaware not Germany).
  'AL': { admin1:'Alabama',              cc:'US' },
  'AK': { admin1:'Alaska',              cc:'US' },
  'AZ': { admin1:'Arizona',             cc:'US' },
  'AR': { admin1:'Arkansas',            cc:'US' },
  'CA': { admin1:'California',          cc:'US' },
  'CO': { admin1:'Colorado',            cc:'US' },
  'CT': { admin1:'Connecticut',         cc:'US' },
  'DE': { admin1:'Delaware',            cc:'US' },
  'FL': { admin1:'Florida',             cc:'US' },
  'GA': { admin1:'Georgia',             cc:'US' },
  'HI': { admin1:'Hawaii',              cc:'US' },
  'ID': { admin1:'Idaho',               cc:'US' },
  'IL': { admin1:'Illinois',            cc:'US' },
  'IN': { admin1:'Indiana',             cc:'US' },
  'IA': { admin1:'Iowa',                cc:'US' },
  'KS': { admin1:'Kansas',              cc:'US' },
  'KY': { admin1:'Kentucky',            cc:'US' },
  'LA': { admin1:'Louisiana',           cc:'US' },
  'ME': { admin1:'Maine',               cc:'US' },
  'MD': { admin1:'Maryland',            cc:'US' },
  'MA': { admin1:'Massachusetts',       cc:'US' },
  'MI': { admin1:'Michigan',            cc:'US' },
  'MN': { admin1:'Minnesota',           cc:'US' },
  'MS': { admin1:'Mississippi',         cc:'US' },
  'MO': { admin1:'Missouri',            cc:'US' },
  'MT': { admin1:'Montana',             cc:'US' },
  'NE': { admin1:'Nebraska',            cc:'US' },
  'NV': { admin1:'Nevada',              cc:'US' },
  'NH': { admin1:'New Hampshire',       cc:'US' },
  'NJ': { admin1:'New Jersey',          cc:'US' },
  'NM': { admin1:'New Mexico',          cc:'US' },
  'NY': { admin1:'New York',            cc:'US' },
  'NC': { admin1:'North Carolina',      cc:'US' },
  'ND': { admin1:'North Dakota',        cc:'US' },
  'OH': { admin1:'Ohio',                cc:'US' },
  'OK': { admin1:'Oklahoma',            cc:'US' },
  'OR': { admin1:'Oregon',              cc:'US' },
  'PA': { admin1:'Pennsylvania',        cc:'US' },
  'RI': { admin1:'Rhode Island',        cc:'US' },
  'SC': { admin1:'South Carolina',      cc:'US' },
  'SD': { admin1:'South Dakota',        cc:'US' },
  'TN': { admin1:'Tennessee',           cc:'US' },
  'TX': { admin1:'Texas',               cc:'US' },
  'UT': { admin1:'Utah',                cc:'US' },
  'VT': { admin1:'Vermont',             cc:'US' },
  'VA': { admin1:'Virginia',            cc:'US' },
  'WA': { admin1:'Washington',          cc:'US' }, // AU Western Australia: type full name
  'WV': { admin1:'West Virginia',       cc:'US' },
  'WI': { admin1:'Wisconsin',           cc:'US' },
  'WY': { admin1:'Wyoming',             cc:'US' },
  'DC': { admin1:'District of Columbia',cc:'US' },
  // ── Australian states & territories (6) ───────────────────
  // WA = Washington (US) above; NT = Northwest Territories (CA) above
  'NSW': { admin1:'New South Wales',              cc:'AU' },
  'VIC': { admin1:'Victoria',                     cc:'AU' },
  'QLD': { admin1:'Queensland',                   cc:'AU' },
  'SA':  { admin1:'South Australia',              cc:'AU' },
  'TAS': { admin1:'Tasmania',                     cc:'AU' },
  'ACT': { admin1:'Australian Capital Territory', cc:'AU' },
  // ── German Länder — ISO 3166-2:DE codes (16) ──────────────
  'BB':  { admin1:'Brandenburg',            cc:'DE' },
  'BE':  { admin1:'Berlin',                 cc:'DE' }, // CH Bern: type "Bern" or "Switzerland"
  'BW':  { admin1:'Baden-Württemberg',      cc:'DE' },
  'BY':  { admin1:'Bavaria',                cc:'DE' },
  'HB':  { admin1:'Bremen',                 cc:'DE' },
  'HE':  { admin1:'Hesse',                  cc:'DE' },
  'HH':  { admin1:'Hamburg',                cc:'DE' },
  'MV':  { admin1:'Mecklenburg-Vorpommern', cc:'DE' },
  'NI':  { admin1:'Lower Saxony',           cc:'DE' },
  'NW':  { admin1:'North Rhine-Westphalia', cc:'DE' }, // CH Nidwalden: type full name
  'RP':  { admin1:'Rhineland-Palatinate',   cc:'DE' },
  'SH':  { admin1:'Schleswig-Holstein',     cc:'DE' }, // CH Schaffhausen: type full name
  'SL':  { admin1:'Saarland',               cc:'DE' },
  'SN':  { admin1:'Saxony',                 cc:'DE' },
  'ST':  { admin1:'Saxony-Anhalt',          cc:'DE' },
  'TH':  { admin1:'Thuringia',              cc:'DE' },
  // ── Swiss cantons — non-conflicting (20) ──────────────────
  // Omitted due to conflicts with above: AR(US), BE(DE), FR(ISO), NE(US), NW(DE), SH(DE)
  'AG':  { admin1:'Aargau',                         cc:'CH' },
  'AI':  { admin1:'Appenzell Innerrhoden',           cc:'CH' },
  'BL':  { admin1:'Basel-Landschaft',                cc:'CH' },
  'BS':  { admin1:'Basel-Stadt',                     cc:'CH' },
  'GE':  { admin1:'Geneva',                          cc:'CH' },
  'GL':  { admin1:'Glarus',                          cc:'CH' },
  'GR':  { admin1:'Graubunden',                      cc:'CH' }, // matches Graubünden via normalization
  'JU':  { admin1:'Jura',                            cc:'CH' },
  'LU':  { admin1:'Lucerne',                         cc:'CH' },
  'OW':  { admin1:'Obwalden',                        cc:'CH' },
  'SG':  { admin1:'St. Gallen',                      cc:'CH' },
  'SO':  { admin1:'Solothurn',                       cc:'CH' },
  'SZ':  { admin1:'Schwyz',                          cc:'CH' },
  'TG':  { admin1:'Thurgau',                         cc:'CH' },
  'TI':  { admin1:'Ticino',                          cc:'CH' },
  'UR':  { admin1:'Uri',                             cc:'CH' },
  'VD':  { admin1:'Vaud',                            cc:'CH' },
  'VS':  { admin1:'Valais',                          cc:'CH' },
  'ZG':  { admin1:'Zug',                             cc:'CH' },
  'ZH':  { admin1:'Zurich',                          cc:'CH' },
};

// Unit preference (persisted)
let useFahrenheit = localStorage.getItem('unit') === 'F';
applyUnitButtons();

function applyUnitButtons() {
  btnC.setAttribute('aria-pressed', !useFahrenheit);
  btnF.setAttribute('aria-pressed',  useFahrenheit);
  btnC.classList.toggle('active', !useFahrenheit);
  btnF.classList.toggle('active',  useFahrenheit);
}

// Map weather code → background theme
function weatherTheme(code) {
  if (code === 0)                          return 'clear';
  if (code <= 3)                           return 'cloudy';
  if (code <= 48)                          return 'fog';
  if (code <= 67)                          return 'rain';
  if (code <= 77)                          return 'snow';
  if (code <= 82)                          return 'rain';
  return 'storm';
}

function applyTheme(code) {
  document.body.dataset.theme = weatherTheme(code);
}

function toDisplay(celsius) {
  if (useFahrenheit) return Math.round(celsius * 9 / 5 + 32);
  return Math.round(celsius);
}

function unitSymbol() {
  return useFahrenheit ? '°F' : '°C';
}

function getWeatherLabel(code) {
  return weatherCodes[code] ?? ['Unknown', '🌡️'];
}

// ── SVG Weather Icons ──────────────────────────────────────────
function codeToIconType(code) {
  if (code === 0)  return 'sun';
  if (code <= 2)   return 'sun-cloud';
  if (code === 3)  return 'cloud';
  if (code <= 48)  return 'fog';
  if (code <= 55)  return 'drizzle';
  if (code <= 67)  return 'rain';
  if (code <= 77)  return 'snow';
  if (code <= 82)  return 'rain';
  return 'storm';
}

function getWeatherIcon(code) {
  const type = codeToIconType(code);

  // Reusable cloud paths
  const cLg  = `M7,27 C4,27 3,23 5,21 C4,15 9,12 14,14 C15,8 25,8 27,14 C31,10 37,14 35,20 C39,19 39,25 35,26 Z`;
  const cHi  = `M7,24 C4,24 3,20 5,18 C4,12 9,9 14,11 C15,5 25,5 27,11 C31,7 37,11 35,17 C39,16 39,22 35,23 Z`;
  const cDk  = `M7,24 C4,24 3,20 5,18 C4,12 9,9 14,11 C15,5 25,5 27,11 C31,7 37,11 35,17 C39,16 39,22 35,23 Z`;
  const cFog = `M7,21 C4,21 3,17 5,15 C4,9 9,6 14,8 C15,2 25,2 27,8 C31,4 37,8 35,14 C39,13 39,19 35,20 Z`;
  const cSm  = `M4,36 C1,36 0,32 2,30 C1,25 6,23 10,24 C11,21 17,20 20,23 C23,21 27,23 27,28 C31,28 31,34 27,35 Z`;

  // Reusable drop sets
  const drops3 = `<g stroke="#5090C8" stroke-width="1.8" stroke-linecap="round">
    <line class="wx-d1" x1="13" y1="27" x2="11" y2="35"/>
    <line class="wx-d2" x1="21" y1="27" x2="19" y2="35"/>
    <line class="wx-d3" x1="29" y1="27" x2="27" y2="35"/>
  </g>`;
  const drops5 = `<g stroke="#3A7AB8" stroke-width="1.8" stroke-linecap="round">
    <line class="wx-d1" x1="11" y1="27" x2="9"  y2="34"/>
    <line class="wx-d2" x1="19" y1="27" x2="17" y2="34"/>
    <line class="wx-d3" x1="27" y1="27" x2="25" y2="34"/>
    <line class="wx-d4" x1="15" y1="31" x2="13" y2="38"/>
    <line class="wx-d5" x1="23" y1="31" x2="21" y2="38"/>
  </g>`;

  const svgs = {
    sun: `
      <g class="wx-spin">
        <circle cx="20" cy="20" r="7" fill="#FFCA28" stroke="#F59E0B" stroke-width="1.5"/>
        <g stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round">
          <line x1="20" y1="3"  x2="20" y2="8"/>
          <line x1="20" y1="32" x2="20" y2="37"/>
          <line x1="3"  y1="20" x2="8"  y2="20"/>
          <line x1="32" y1="20" x2="37" y2="20"/>
          <line x1="7.8"  y1="7.8"  x2="11.3" y2="11.3"/>
          <line x1="28.7" y1="28.7" x2="32.2" y2="32.2"/>
          <line x1="32.2" y1="7.8"  x2="28.7" y2="11.3"/>
          <line x1="7.8"  y1="32.2" x2="11.3" y2="28.7"/>
        </g>
      </g>`,

    'sun-cloud': `
      <g class="wx-spin-sm">
        <circle cx="28" cy="13" r="6" fill="#FFCA28" stroke="#F59E0B" stroke-width="1.4"/>
        <g stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round">
          <line x1="28" y1="3"  x2="28" y2="6.5"/>
          <line x1="28" y1="19.5" x2="28" y2="23"/>
          <line x1="18" y1="13" x2="21.5" y2="13"/>
          <line x1="34.5" y1="13" x2="38" y2="13"/>
          <line x1="21.8" y1="6.8"  x2="23.9" y2="8.9"/>
          <line x1="32.1" y1="17.1" x2="34.2" y2="19.2"/>
          <line x1="34.2" y1="6.8"  x2="32.1" y2="8.9"/>
          <line x1="21.8" y1="19.2" x2="23.9" y2="17.1"/>
        </g>
      </g>
      <path d="${cSm}"
        fill="rgba(224,234,242,0.95)" stroke="#B0C4D4" stroke-width="1.5" stroke-linejoin="round"/>`,

    cloud: `
      <path d="${cLg}"
        fill="rgba(224,234,242,0.95)" stroke="#B0C4D4" stroke-width="1.5" stroke-linejoin="round"/>`,

    fog: `
      <path d="${cFog}"
        fill="rgba(224,234,242,0.95)" stroke="#B0C4D4" stroke-width="1.5" stroke-linejoin="round"/>
      <g class="wx-fog" stroke="#A8BCCA" stroke-width="2.2" stroke-linecap="round">
        <line x1="4"  y1="25" x2="30" y2="25"/>
        <line x1="8"  y1="31" x2="36" y2="31"/>
        <line x1="4"  y1="37" x2="26" y2="37"/>
      </g>`,

    drizzle: `
      <path d="${cHi}" fill="rgba(224,234,242,0.95)" stroke="#B0C4D4" stroke-width="1.5" stroke-linejoin="round"/>
      ${drops3}`,

    rain: `
      <path d="${cDk}" fill="rgba(184,208,226,0.95)" stroke="#8AAABF" stroke-width="1.5" stroke-linejoin="round"/>
      ${drops5}`,

    snow: `
      <path d="${cHi}" fill="rgba(224,234,242,0.95)" stroke="#B0C4D4" stroke-width="1.5" stroke-linejoin="round"/>
      <g stroke="#7AAAD8" stroke-width="1.6" stroke-linecap="round">
        <g class="wx-f1">
          <line x1="13" y1="27" x2="13" y2="35"/>
          <line x1="9"  y1="31" x2="17" y2="31"/>
          <line x1="10.3" y1="28.3" x2="15.7" y2="33.7"/>
          <line x1="15.7" y1="28.3" x2="10.3" y2="33.7"/>
        </g>
        <g class="wx-f2">
          <line x1="27" y1="27" x2="27" y2="35"/>
          <line x1="23" y1="31" x2="31" y2="31"/>
          <line x1="24.3" y1="28.3" x2="29.7" y2="33.7"/>
          <line x1="29.7" y1="28.3" x2="24.3" y2="33.7"/>
        </g>
      </g>`,

    storm: `
      <path d="${cDk}" fill="rgba(168,194,210,0.95)" stroke="#7896A8" stroke-width="1.5" stroke-linejoin="round"/>
      <g stroke="#3A7AB8" stroke-width="1.8" stroke-linecap="round">
        <line class="wx-d1" x1="10" y1="27" x2="8"  y2="33"/>
        <line class="wx-d3" x1="30" y1="27" x2="28" y2="33"/>
      </g>
      <path class="wx-flash" d="M22,25 L16,34 L21,34 L18,40 L28,29 L23,29 Z"
        fill="#F9C74F" stroke="#D4860A" stroke-width="1" stroke-linejoin="round"/>`,
  };

  const inner = svgs[type] ?? svgs.cloud;
  return `<svg class="wx-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}

// ── Search hint (empty input / validation) ─────────────────
function showHint(msg) {
  searchHint.textContent = msg;
  input.classList.remove('shake');
  void input.offsetWidth; // reflow to restart animation
  input.classList.add('shake');
  input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
}

function clearHint() {
  searchHint.textContent = '';
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.setAttribute('aria-busy', on);
}

function showSkeleton() {
  const forecastSkeletons = Array.from({ length: 5 }, () => `
    <div class="forecast-card skeleton-card">
      <div class="skel skel-day"></div>
      <div class="skel skel-icon"></div>
      <div class="skel skel-temps"></div>
    </div>`).join('');

  results.innerHTML = `
    <div class="weather-card skeleton-card">
      <div class="skel skel-city"></div>
      <div class="skel skel-temp"></div>
      <div class="skel skel-cond"></div>
    </div>
    <section class="forecast" aria-label="Loading forecast">
      ${forecastSkeletons}
    </section>
  `;
}

function showError(message) {
  results.innerHTML = `<p class="placeholder error">${message}</p>`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Last fetched data — kept in memory so toggle re-renders without re-fetching
let lastWeather = null;

function windDirName(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function windCompassSVG(speed, direction) {
  const dir = windDirName(direction);
  const spd = Math.round(speed);
  // Arrow points downwind (where the wind is going): direction + 180
  const arrowAngle = (direction + 180) % 360;
  const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  return `
  <svg class="wind-compass" viewBox="0 0 80 80" fill="none"
       xmlns="http://www.w3.org/2000/svg"
       aria-label="Wind from ${dir} at ${spd} km/h">
    <!-- Outer ring -->
    <circle cx="40" cy="40" r="34"
      fill="rgba(255,255,255,0.35)" stroke="rgba(176,196,212,0.6)" stroke-width="1.5"/>
    <!-- Arrow pointing downwind, rotated around centre -->
    <g transform="rotate(${arrowAngle}, 40, 40)">
      <!-- Shaft from just above hub to near edge -->
      <line x1="40" y1="50" x2="40" y2="23"
        stroke="#4f8ef7" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Arrowhead -->
      <path d="M40,14 L34.5,25 L45.5,25 Z" fill="#4f8ef7"/>
    </g>
    <!-- Hub circle -->
    <circle cx="40" cy="40" r="13"
      fill="white" stroke="rgba(176,196,212,0.5)" stroke-width="1"/>
    <!-- Speed -->
    <text x="40" y="38" text-anchor="middle" dominant-baseline="middle"
      font-size="11" font-weight="700" fill="#2D3748"
      font-family="${font}">${spd}</text>
    <text x="40" y="49" text-anchor="middle" dominant-baseline="middle"
      font-size="6.5" fill="#8A9AAA"
      font-family="${font}">km/h</text>
  </svg>`;
}

function renderWeather() {
  if (!lastWeather) return;
  const { city, tempC, weatherCode, daily, windspeed, winddirection } = lastWeather;
  const [description] = getWeatherLabel(weatherCode);

  const forecastCards = daily.time.map((dateStr, i) => {
    const day = DAY_NAMES[new Date(dateStr + 'T12:00:00').getDay()];
    const high = toDisplay(daily.temperature_2m_max[i]);
    const low  = toDisplay(daily.temperature_2m_min[i]);
    return `
      <article class="forecast-card">
        <h3 class="forecast-day">${day}</h3>
        <span class="forecast-icon">${getWeatherIcon(daily.weathercode[i])}</span>
        <p class="forecast-temps">
          <span class="high">${high}°</span>
          <span class="low">${low}°</span>
        </p>
      </article>`;
  }).join('');

  results.innerHTML = `
    <article class="weather-card">
      <h2 class="city-name">${city}</h2>
      <div class="wx-main-icon">${getWeatherIcon(weatherCode)}</div>
      <p class="temperature">${toDisplay(tempC)}${unitSymbol()}</p>
      <p class="conditions">${description}</p>
      <div class="wind-row">
        ${windCompassSVG(windspeed, winddirection)}
        <span class="wind-from">From ${windDirName(winddirection)}</span>
      </div>
    </article>
    <section class="forecast" aria-label="5-day forecast">
      ${forecastCards}
    </section>
    <div class="chart-card" aria-label="Temperature trend chart">
      <canvas id="temp-chart"></canvas>
    </div>
  `;
  drawChart(daily);
}

function drawChart(daily) {
  const canvas = document.getElementById('temp-chart');
  if (!canvas) return;

  const highs = daily.temperature_2m_max.map(t => toDisplay(t));
  const lows  = daily.temperature_2m_min.map(t => toDisplay(t));
  const days  = daily.time.map(d => DAY_NAMES[new Date(d + 'T12:00:00').getDay()]);
  const n = highs.length;

  // Rounded rectangle helper (broad browser support)
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Catmull-Rom smooth path through points
  function catmullPath(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }

  function render(hoverIdx = null) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    // Set canvas resolution once or when size changes
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 28, right: 16, bottom: 32, left: 38 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    // Y-axis scale with breathing room
    const allTemps = [...highs, ...lows];
    const rawMin = Math.min(...allTemps);
    const rawMax = Math.max(...allTemps);
    const rawRange = rawMax - rawMin || 4;
    const yMin = rawMin - rawRange * 0.18;
    const yMax = rawMax + rawRange * 0.18;
    const yRange = yMax - yMin;

    const toY = t => pad.top + ch * (1 - (t - yMin) / yRange);
    const toX = i => pad.left + (n > 1 ? (i / (n - 1)) * cw : cw / 2);

    const highPts = highs.map((t, i) => ({ x: toX(i), y: toY(t), t }));
    const lowPts  = lows.map( (t, i) => ({ x: toX(i), y: toY(t), t }));

    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    // ── Horizontal gridlines + y-axis labels
    const gridSteps = 3;
    for (let i = 0; i <= gridSteps; i++) {
      const t = yMin + (yRange * i) / gridSteps;
      const y = toY(t);
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.stroke();
      ctx.fillStyle = '#aab0bc';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(t) + '°', pad.left - 6, y);
    }

    // ── X-axis day labels
    ctx.fillStyle = '#8a93a6';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < n; i++) {
      ctx.fillText(days[i], toX(i), H - 7);
    }

    // ── Draw a smooth line
    function drawLine(pts, color) {
      ctx.save();
      catmullPath(ctx, pts);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();
    }

    // ── Draw dots at each data point
    function drawDots(pts, color, hi) {
      pts.forEach((p, i) => {
        const hovered = i === hi;
        ctx.beginPath();
        ctx.arc(p.x, p.y, hovered ? 5.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? color : '#fff';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }

    drawLine(lowPts,  '#7db8f5');
    drawLine(highPts, '#f97b4f');
    drawDots(highPts, '#f97b4f', hoverIdx);
    drawDots(lowPts,  '#7db8f5', hoverIdx);

    // ── Hover overlay
    if (hoverIdx !== null) {
      const x = toX(hoverIdx);

      // Vertical guide line
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + ch);
      ctx.stroke();
      ctx.restore();

      // Tooltip
      const sym = unitSymbol();
      const label = `${days[hoverIdx]}   ↑ ${highs[hoverIdx]}${sym}   ↓ ${lows[hoverIdx]}${sym}`;
      ctx.font = '600 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const tw = ctx.measureText(label).width;
      const tW = tw + 22;
      const tH = 26;
      let tX = x - tW / 2;
      const tY = pad.top - 6 - tH;
      tX = Math.max(pad.left, Math.min(tX, W - pad.right - tW));

      ctx.save();
      ctx.fillStyle = 'rgba(26,26,46,0.82)';
      roundRect(ctx, tX, tY, tW, tH, 7);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, tX + tW / 2, tY + tH / 2);
      ctx.restore();
    }
  }

  render();

  // Hover interaction
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padL = 38, padR = 16;
    const cw = canvas.offsetWidth - padL - padR;
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const x = padL + (n > 1 ? (i / (n - 1)) * cw : cw / 2);
      const d = Math.abs(mouseX - x);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    }
    render(nearestIdx);
  });
  canvas.addEventListener('mouseleave', () => render(null));
}

// Strip diacritics for fuzzy admin1 matching (e.g. "Zürich" → "zurich")
function normalizeStr(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Parse "City, Qualifier1, Qualifier2" into structured geocoding intent.
// Resolution order per qualifier:
//   1. Known admin1 abbreviation (ADMIN1_ABBREVS) — sets both admin1Filter and countryCode
//   2. Known country name / alias (COUNTRY_NAMES) — sets countryCode
//   3. Bare 2-letter ISO code not in ADMIN1_ABBREVS — sets countryCode
//   4. Anything else treated as a raw admin1 string (e.g. "Ontario", "Bavaria")
function parseQuery(raw) {
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 1) return { city: parts[0], countryCode: null, admin1Filter: null };

  const city = parts[0];
  let countryCode = null;
  let admin1Filter = null;

  for (const q of parts.slice(1)) {
    const upper = q.toUpperCase();
    const lower = q.toLowerCase();

    if (ADMIN1_ABBREVS[upper]) {
      const m = ADMIN1_ABBREVS[upper];
      if (!admin1Filter) admin1Filter = m.admin1;
      if (!countryCode)  countryCode  = m.cc;
    } else if (COUNTRY_NAMES[lower]) {
      if (!countryCode) countryCode = COUNTRY_NAMES[lower];
    } else if (/^[A-Z]{2,3}$/.test(upper)) {
      // Treat as a bare ISO country code (e.g. "ES", "FR", "JP")
      if (!countryCode) countryCode = upper;
    } else {
      // Raw admin1 text (e.g. "Ontario", "Bavaria", "Extremadura")
      if (!admin1Filter) admin1Filter = q;
    }
  }

  return { city, countryCode, admin1Filter };
}

async function safeFetch(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('network');
  }
  if (!res.ok) throw new Error('server');
  return res;
}

async function search(rawInput) {
  const { city, countryCode, admin1Filter } = parseQuery(rawInput);

  lastWeather = null;
  setLoading(true);
  showSkeleton();

  // 1. Geocode — fetch up to 10 candidates so we can filter client-side
  let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en`;
  if (countryCode) geoUrl += `&countryCode=${countryCode}`;

  const geoRes = await safeFetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData.results?.length) {
    showError('City not found. Try a different name or search for a nearby city.');
    setLoading(false);
    return;
  }

  // 2. Filter by admin1 if a sub-national qualifier was given
  let candidates = geoData.results;
  if (admin1Filter) {
    const needle = normalizeStr(admin1Filter);
    const filtered = candidates.filter(r =>
      normalizeStr(r.admin1 ?? '').includes(needle) ||
      normalizeStr(r.admin2 ?? '').includes(needle)
    );
    if (filtered.length > 0) candidates = filtered;
    // else fall through — country filter already narrowed the list
  }

  const { latitude, longitude, name, country, admin1 } = candidates[0];
  // Include admin1 so users can confirm which city they got
  const displayName = [name, admin1, country].filter(Boolean).join(', ');

  // 3. Fetch current weather + 5-day forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`
    + `&current_weather=true`
    + `&daily=temperature_2m_max,temperature_2m_min,weathercode`
    + `&timezone=auto`
    + `&forecast_days=5`;
  const weatherRes = await safeFetch(weatherUrl);
  const weatherData = await weatherRes.json();

  const { temperature, weathercode, windspeed, winddirection } = weatherData.current_weather;
  lastWeather = { city: displayName, tempC: temperature, weatherCode: weathercode, daily: weatherData.daily, windspeed, winddirection };
  applyTheme(weathercode);
  setLoading(false);
  renderWeather();
}

input.addEventListener('input', clearHint);

[btnC, btnF].forEach(btn => {
  btn.addEventListener('click', () => {
    useFahrenheit = btn === btnF;
    localStorage.setItem('unit', useFahrenheit ? 'F' : 'C');
    applyUnitButtons();
    renderWeather();
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = input.value.trim();

  if (!city) {
    showHint('Please enter a city name.');
    input.focus();
    return;
  }

  clearHint();

  try {
    await search(city);
  } catch (err) {
    setLoading(false);
    if (err.message === 'network') {
      showError('No connection. Check your network and try again.');
    } else {
      showError('Weather service unavailable. Try again in a moment.');
    }
    console.error(err);
  }
});
