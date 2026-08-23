'use client';

// Bump this when stundu / konsultāciju / pulciņu data changes.
const SCHEDULE_UPDATED = '23.08.26';

export default function Home() {
  return (
    <>
      {/* Login modal (password protection for schedules) */}
      <div id="loginModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => closeLogin()}>
            &times;
          </span>
          <h2 data-i18n="loginTitle">Ienākt sistēmā</h2>
          <p data-i18n="loginHint">
            Demonstrācijas versija ar izdomātiem datiem. Parole: Tests123?
          </p>
          <form id="loginForm">
            <input
              type="password"
              id="passwordInput"
              placeholder="Parole"
              data-i18n-placeholder="password"
              required
            />
            <button type="submit" data-i18n="loginSubmit">
              Ienākt
            </button>
          </form>
          <p id="loginError" className="error hidden" data-i18n="loginError">
            Nepareiza parole. Pamēģiniet vēlreiz!
          </p>
        </div>
      </div>

      {/* Accessibility / appearance settings modal */}
      <div id="settingsModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => closeSettings()}>
            &times;
          </span>
          <h2 data-i18n="settings">Piekļūstamības iestatījumi</h2>
          <form id="settingsForm">
            <div className="setting-group">
              <label htmlFor="bgColor" data-i18n="bgColor">
                Fona krāsa:
              </label>
              <input type="color" id="bgColor" defaultValue="#f9f9f9" />
            </div>
            <div className="setting-group">
              <label htmlFor="textColor" data-i18n="textColor">
                Teksta krāsa:
              </label>
              <input type="color" id="textColor" defaultValue="#333333" />
            </div>
            <div className="setting-group">
              <label htmlFor="headerBg" data-i18n="headerBg">
                Titullauka krāsa:
              </label>
              <input type="color" id="headerBg" defaultValue="#1e3d28" />
            </div>
            <div className="setting-group">
              <label htmlFor="accentColor" data-i18n="accentColor">
                Akcenta krāsa:
              </label>
              <input type="color" id="accentColor" defaultValue="#7123a5" />
            </div>
            <div className="setting-group">
              <label htmlFor="borderColor" data-i18n="borderColor">
                Robežu krāsa:
              </label>
              <input type="color" id="borderColor" defaultValue="#dddddd" />
            </div>
            <div className="setting-group">
              <label htmlFor="cardBg" data-i18n="cardBg">
                Kartīšu fona krāsa:
              </label>
              <input type="color" id="cardBg" defaultValue="#ffffff" />
            </div>
            <div className="setting-group">
              <label htmlFor="modalBg" data-i18n="modalBg">
                Modāļa fona krāsa:
              </label>
              <input type="color" id="modalBg" defaultValue="#fefefe" />
            </div>
            <div className="setting-group">
              <label htmlFor="fontFamily" data-i18n="fontFamily">
                Fonts:
              </label>
              <select id="fontFamily">
                <option value="Arial, sans-serif">Arial</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Lato', sans-serif">Lato</option>
              </select>
            </div>
            <div className="setting-group">
              <label htmlFor="fontSize" data-i18n="fontSize">
                Fonta izmērs:
              </label>
              <select id="fontSize">
                <option value="14px" data-i18n="fontSmall">
                  Mazs (14px)
                </option>
                <option value="16px" data-i18n="fontMedium">
                  Vidējs (16px)
                </option>
                <option value="18px" data-i18n="fontLarge">
                  Liels (18px)
                </option>
                <option value="20px" data-i18n="fontXLarge">
                  Ļoti liels (20px)
                </option>
              </select>
            </div>
            <button type="submit" data-i18n="save">
              Saglabāt
            </button>
            <button type="button" onClick={() => resetSettings()} data-i18n="reset">
              Atiestatīt
            </button>
          </form>
        </div>
      </div>

      <div className="demo-banner" data-i18n="demoBanner">
        DEMO · izdomāti dati · parole: Tests123?
      </div>

      {/* Public content (shown before login) */}
      <div id="publicContent">
        <header>
          <div style={{ position: 'relative' }}>
            <h1 data-i18n="schoolName">Tests skola</h1>
            <p data-i18n="semester2">DEMO · II semestris</p>
            <div className="header-controls">
              <button
                onClick={() => openLogin()}
                data-i18n="login"
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Ienākt sistēmā
              </button>
              <button
                id="public-lang-toggle"
                className="lang-toggle"
                type="button"
                data-i18n="langButton"
                data-i18n-aria="langAria"
                aria-label="Valoda"
              >
                EN
              </button>
              <button
                id="public-settings-toggle"
                className="settings-toggle"
                type="button"
                data-i18n-aria="settingsAria"
                aria-label="Piekļūstamības iestatījumi"
              >
                <img src="/hamsterwheel.gif" alt="" width="40" height="40" />
              </button>
              <button
                id="public-theme-toggle"
                className="theme-toggle"
                type="button"
                data-i18n-aria="themeToggle"
                aria-label="Pārslēgt tumšo / gaišo režīmu"
                aria-pressed="false"
              >
                <img src="/lightmode.gif" alt="" width="40" height="40" />
              </button>
            </div>
          </div>
        </header>
        <main className="public-stage">
          <p className="public-photo-credit" data-i18n="photoCredit">
            Demonstrācijas versija
          </p>
          {/* Public tasks hidden until ready
          <div className="nav-box">
            <select id="public-grade-select">
              <option value="">Izvēlieties klasi</option>
              <option value="grade-2">2. klase</option>
              <option value="grade-3">3. klase</option>
            </select>
            <select id="public-subject-select">
              <option value="">Izvēlieties priekšmetu</option>
            </select>
            <div
              id="public-task-radios"
              className="radio-group"
              style={{ display: 'none' }}
            />
            <div className="button-group">
              <button onClick={() => clearPublicSelections()}>Notīrīt</button>
              <a className="progress-link" href="/progress.html">
                Mans progress
              </a>
            </div>
          </div>
          <div id="public-content"></div>
          */}
        </main>
      </div>

      {/* Main visible content (shown after login) */}
      <div id="mainContent" className="hidden">
        <header>
          <div style={{ position: 'relative' }}>
            <h1 data-i18n="schoolName">Tests skola</h1>
            <p data-i18n="semester2">DEMO · II semestris</p>
            <p
              className="schedule-updated"
              data-i18n-aria="updatedAria"
              data-updated={SCHEDULE_UPDATED}
              aria-label={`Pēdējoreiz atjaunots ${SCHEDULE_UPDATED}`}
            >
              🔄 {SCHEDULE_UPDATED}.
            </p>
            <p id="my-class-chip" className="my-class-chip hidden" hidden>
              <span data-i18n="myClass">Mana klase</span>:{' '}
              <strong id="my-class-label"></strong>
            </p>
            <div className="header-controls">
              <label className="toggle-switch">
                <input type="checkbox" id="address-toggle" defaultChecked />
                <span className="slider">
                  <span className="slider-text-k">P</span>
                  <span className="slider-text-s">E</span>
                </span>
              </label>
              <button
                id="settings-toggle"
                className="settings-toggle"
                type="button"
                data-i18n-aria="settingsAria"
                aria-label="Piekļūstamības iestatījumi"
              >
                <img src="/hamsterwheel.gif" alt="" width="40" height="40" />
              </button>
              <button
                id="theme-toggle"
                className="theme-toggle"
                type="button"
                data-i18n-aria="themeToggle"
                aria-label="Pārslēgt tumšo / gaišo režīmu"
                aria-pressed="false"
              >
                <img src="/lightmode.gif" alt="" width="40" height="40" />
              </button>
            </div>
          </div>
        </header>
        <main>
          <div className="nav-box">
            <div className="radio-group">
              <label htmlFor="sodien-radio">
                <input
                  type="radio"
                  name="section"
                  value="sodien"
                  id="sodien-radio"
                  defaultChecked
                />
                <span data-i18n="navToday">Šodien</span>
              </label>
              <label htmlFor="stundu-radio">
                <input
                  type="radio"
                  name="section"
                  value="stundu"
                  id="stundu-radio"
                />
                <span data-i18n="navLessons">Stundu saraksts</span>
              </label>
              <label htmlFor="konsultaciju-radio">
                <input
                  type="radio"
                  name="section"
                  value="konsultaciju"
                  id="konsultaciju-radio"
                />
                <span data-i18n="navConsult">Konsultāciju saraksts</span>
              </label>
              <label htmlFor="pulcins-radio">
                <input
                  type="radio"
                  name="section"
                  value="pulcins"
                  id="pulcins-radio"
                />
                <span data-i18n="navClubs">Pulciņu saraksts</span>
              </label>
            </div>
            <div id="today-filters" className="today-filters">
              <label className="today-filter">
                <span data-i18n="teacher">Skolotājs</span>
                <input
                  type="text"
                  id="filter-teacher"
                  list="teacher-options"
                  placeholder="Sākt rakstīt vārdu…"
                  data-i18n-placeholder="teacherPlaceholder"
                  autoComplete="off"
                />
                <datalist id="teacher-options"></datalist>
              </label>
              <label className="today-filter">
                <span data-i18n="room">Telpa</span>
                <input
                  type="text"
                  id="filter-room"
                  list="room-options"
                  placeholder="102.k."
                  autoComplete="off"
                />
                <datalist id="room-options"></datalist>
              </label>
              <label className="today-filter">
                <span data-i18n="club">Pulciņš</span>
                <input
                  type="text"
                  id="filter-club"
                  list="club-options"
                  placeholder="Pulciņa nosaukums"
                  data-i18n-placeholder="clubPlaceholder"
                  autoComplete="off"
                />
                <datalist id="club-options"></datalist>
              </label>
            </div>
            <input
              type="text"
              id="searchInput"
              placeholder="Meklēt pēc skolotāja, pulciņa, telpas....."
              data-i18n-placeholder="searchPlaceholder"
            />
            <select id="grade-select">
              <option value="" data-i18n="allClasses">
                Visas klases
              </option>
            </select>
            <div className="button-group">
              <button onClick={() => clearSelections()} data-i18n="clear">
                Notīrīt
              </button>
              <button onClick={() => logout()} data-i18n="logout">
                Iziet
              </button>
            </div>
          </div>
          <div id="content"></div>
          <div id="noResults" className="hidden">
            <span data-i18n="noResults">
              Nav atrasts atbilstošs. Pamēģiniet citu meklēšanu!
            </span>
          </div>
        </main>
        <footer>
          <p data-i18n="versionBeta">Demonstrācijas versija</p>
          <p
            className="schedule-updated"
            data-i18n-aria="updatedAria"
            data-updated={SCHEDULE_UPDATED}
            aria-label={`Pēdējoreiz atjaunots ${SCHEDULE_UPDATED}`}
          >
            🔄 {SCHEDULE_UPDATED}.
          </p>
          <p>berzsberzinsh@gmail.com</p>
        </footer>
        <div id="page-tools" className="page-tools">
          <button
            id="lang-toggle"
            className="lang-toggle"
            type="button"
            data-i18n="langButton"
            data-i18n-aria="langAria"
            aria-label="Valoda"
          >
            EN
          </button>
        </div>
      </div>
    </>
  );
}
