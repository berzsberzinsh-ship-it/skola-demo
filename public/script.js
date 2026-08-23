/* global document, localStorage, fetch, alert, console, navigator, location, setTimeout, setInterval, clearInterval, window */

let currentAddress = 'K';
let currentSection = 'sodien';
let currentGrade = '';
let currentQuery = '';
let currentFilterTeacher = '';
let currentFilterRoom = '';
let currentFilterClub = '';
let usingOfflineCache = false;
let todayTicker = null;
let authListenersBound = false;
let themeToggleBound = false;

// Cached data from API
let cachedSchedules = {};
let cachedLessonTimes = {};
let cachedKonsultacijas = {};

const PREF_ADDRESS = 'rvs_address';
const PREF_TEACHER = 'rvs_teacher';
const PREF_ROOM = 'rvs_room';
const PREF_CLUB = 'rvs_club';

function t(key, vars) {
  return window.RVS_I18N ? window.RVS_I18N.t(key, vars) : key;
}

function tr(text) {
  return window.RVS_I18N ? window.RVS_I18N.translatePhrase(text) : text;
}

function trDay(day) {
  return window.RVS_I18N ? window.RVS_I18N.translateDay(day) : day;
}

function trNote(text) {
  if (!text) return text;
  let out = tr(text);
  if (window.RVS_I18N && window.RVS_I18N.getLanguage() === 'en') {
    out = String(out)
      .replace(/klases/gi, 'classes')
      .replace(/klašu/gi, '')
      .replace(/klase/gi, 'class');
  }
  return out;
}

// Initialize when script loads
initializeApp();

function initializeApp() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeAppContent();
    });
  } else {
    initializeAppContent();
  }
}

function setPublicView(isPublic) {
  document.body.classList.toggle('public-view', !!isPublic);
  const publicContent = document.getElementById('publicContent');
  if (publicContent) {
    publicContent.style.display = isPublic ? '' : 'none';
  }
}

function initializeAppContent() {
  // Check authentication and show appropriate content
  checkAuthStatus().then((isAuthenticated) => {
    const mainContent = document.getElementById('mainContent');
    const loginModal = document.getElementById('loginModal');
    const settingsModal = document.getElementById('settingsModal');

    if (isAuthenticated) {
      setPublicView(false);
      if (mainContent) mainContent.classList.remove('hidden');
      if (loginModal) loginModal.style.display = 'none';
      waitForElement('#grade-select', () => {
        setupAuthenticatedEventListeners();
        restorePreferences();
        syncSectionChrome();
        updateContent();
      });
    } else {
      setPublicView(true);
      if (mainContent) mainContent.classList.add('hidden');
      if (loginModal) loginModal.style.display = 'none';
    }

    if (settingsModal) settingsModal.style.display = 'none';
  });

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  if (window.RVS_I18N) {
    window.RVS_I18N.applyI18n();
    window.RVS_I18N.bindLanguageToggle();
    window.RVS_I18N.onLanguageChange(() => {
      generateGradeOptions(currentAddress);
      const select = document.getElementById('grade-select');
      if (select && currentGrade) select.value = currentGrade;
      if (window.FlipBookNotes) {
        window.FlipBookNotes.syncToggleLabel();
        if (window.FlipBookNotes.container) {
          const title =
            window.FlipBookNotes.container.querySelector('.flipbook-title');
          const add =
            window.FlipBookNotes.container.querySelector('.add-note');
          if (title) title.textContent = t('notes');
          if (add) add.textContent = t('notesAdd');
          window.FlipBookNotes.renderNotes();
        }
      }
      if (!document.body.classList.contains('public-view')) {
        updateContent();
      }
    });
  }
  syncThemeToggleButtons();
  waitForElement('.theme-toggle', syncThemeToggleButtons);

  // Setup event listeners with observers for React-rendered elements
  setupEventListenersWithObservers();

  // Load accessibility settings
  loadSettings();
}

// Wait for element to appear in DOM (for React hydration timing)
/* global MutationObserver */
function waitForElement(selector, callback, timeout = 5000) {
  const element = document.querySelector(selector);
  if (element) {
    callback();
    return;
  }

  const observer = new MutationObserver(() => {
    const element = document.querySelector(selector);
    if (element) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Fallback timeout
  setTimeout(() => {
    observer.disconnect();
    console.warn(`Element ${selector} not found within ${timeout}ms`);
  }, timeout);
}

function setupEventListenersWithObservers() {
  // Setup login form immediately (exists in HTML)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById('passwordInput');
      const password = passwordInput ? passwordInput.value : '';
      const loginError = document.getElementById('loginError');
      const loginModal = document.getElementById('loginModal');
      const mainContent = document.getElementById('mainContent');

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (data.success) {
          // Store JWT token
          localStorage.setItem('jwt_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (loginModal) loginModal.style.display = 'none';
          setPublicView(false);
          if (mainContent) mainContent.classList.remove('hidden');
          if (passwordInput) passwordInput.value = '';
          if (loginError) loginError.classList.add('hidden');

          waitForElement('#grade-select', () => {
            setupAuthenticatedEventListeners();
            restorePreferences();
            syncSectionChrome();
            updateContent();
          });
        } else {
          if (loginError) loginError.classList.remove('hidden');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (loginError) loginError.classList.remove('hidden');
      }
    });
  }

  bindThemeToggle();
  const publicSettingsToggle = document.getElementById(
    'public-settings-toggle'
  );
  if (publicSettingsToggle)
    publicSettingsToggle.addEventListener('click', openSettings);

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) settingsForm.addEventListener('submit', saveSettings);
}

function setupAuthenticatedEventListeners() {
  if (authListenersBound) return;
  authListenersBound = true;

  const addressToggle = document.querySelector('#address-toggle');
  if (addressToggle)
    addressToggle.addEventListener('change', handleAddressToggle);

  const sectionRadios = document.querySelectorAll('input[name="section"]');
  sectionRadios.forEach((radio) =>
    radio.addEventListener('change', handleSectionChange)
  );

  const gradeSelect = document.querySelector('#grade-select');
  if (gradeSelect) gradeSelect.addEventListener('change', handleGradeChange);

  const searchInput = document.getElementById('searchInput');
  if (searchInput)
    searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value;
      if (currentSection === 'stundu' && currentQuery.trim()) {
        performSearch(currentQuery.trim());
      } else {
        updateContent();
      }
    });

  bindTodayFilterInput('filter-teacher', (value) => {
    currentFilterTeacher = value;
    localStorage.setItem(PREF_TEACHER, value);
  });
  bindTodayFilterInput('filter-room', (value) => {
    currentFilterRoom = value;
    localStorage.setItem(PREF_ROOM, value);
  });
  bindTodayFilterInput('filter-club', (value) => {
    currentFilterClub = value;
    localStorage.setItem(PREF_CLUB, value);
  });

  bindThemeToggle();
  const settingsToggle = document.getElementById('settings-toggle');
  if (settingsToggle) settingsToggle.addEventListener('click', openSettings);
}

function bindTodayFilterInput(id, onChange) {
  const input = document.getElementById(id);
  if (!input) return;
  const apply = () => {
    onChange(input.value.trim());
    if (currentSection === 'sodien') updateContent();
  };
  input.addEventListener('change', apply);
  input.addEventListener('blur', apply);
}

function setupEventListeners() {
  // Legacy function - kept for compatibility
  setupEventListenersWithObservers();
}

function generateGradeOptions(address) {
  let allClasses;
  if (address === 'K') {
    allClasses = [
      '1.a;1.klase;1.kl.',
      '2.a;2.klase;2.kl.',
      '3.a;3.klase;3.kl.',
      '5.a;5.klase;5.kl.',
    ];
  } else if (address === 'Š') {
    allClasses = [
      '6.a;6.klase;6.kl.',
      '7.a;7.klase;7.kl.',
      '8.a;8.klase;8.kl.',
    ];
  } else {
    allClasses = [];
  }
  const sortedSuggestions = allClasses.sort((a, b) => {
    const gradeA = parseInt(a.match(/(\d+)/)[1]);
    const gradeB = parseInt(b.match(/(\d+)/)[1]);
    if (gradeA !== gradeB) return gradeA - gradeB;
    return a.localeCompare(b);
  });
  const select = document.getElementById('grade-select');
  if (select)
    select.innerHTML =
      `<option value="">${t('allClasses')}</option>` +
      sortedSuggestions
        .map((s) => `<option value="${s}">${s.split(';')[0]}</option>`)
        .join('');
}

function gradePrefKey(address) {
  return address === 'Š' ? 'rvs_grade_S' : 'rvs_grade_K';
}

function applyAddressToggle() {
  const toggle = document.getElementById('address-toggle');
  if (toggle) toggle.checked = currentAddress === 'K';
}

function restorePreferences() {
  const savedAddress = localStorage.getItem(PREF_ADDRESS);
  if (savedAddress === 'K' || savedAddress === 'Š') {
    currentAddress = savedAddress;
  }
  applyAddressToggle();
  generateGradeOptions(currentAddress);

  const savedGrade = localStorage.getItem(gradePrefKey(currentAddress)) || '';
  const select = document.getElementById('grade-select');
  if (select && savedGrade) {
    const exists = Array.from(select.options).some((o) => o.value === savedGrade);
    if (exists) {
      select.value = savedGrade;
      currentGrade = savedGrade;
    } else {
      currentGrade = '';
      select.value = '';
    }
  }

  currentFilterTeacher = localStorage.getItem(PREF_TEACHER) || '';
  currentFilterRoom = localStorage.getItem(PREF_ROOM) || '';
  currentFilterClub = localStorage.getItem(PREF_CLUB) || '';
  const teacherInput = document.getElementById('filter-teacher');
  const roomInput = document.getElementById('filter-room');
  const clubInput = document.getElementById('filter-club');
  if (teacherInput) teacherInput.value = currentFilterTeacher;
  if (roomInput) roomInput.value = currentFilterRoom;
  if (clubInput) clubInput.value = currentFilterClub;

  currentSection = 'sodien';
  const sodienRadio = document.getElementById('sodien-radio');
  if (sodienRadio) sodienRadio.checked = true;
  updateMyClassChip();
  applyShareLinkFromUrl();
}

function updateMyClassChip() {
  const chip = document.getElementById('my-class-chip');
  const label = document.getElementById('my-class-label');
  const code = classCode(currentGrade);
  if (!chip || !label) return;
  if (!code) {
    chip.hidden = true;
    chip.classList.add('hidden');
    label.textContent = '';
    return;
  }
  label.textContent = code;
  chip.hidden = false;
  chip.classList.remove('hidden');
}

function syncSectionChrome() {
  const todayFilters = document.getElementById('today-filters');
  const searchInput = document.getElementById('searchInput');
  const isToday = currentSection === 'sodien';
  if (todayFilters) todayFilters.hidden = !isToday;
  if (searchInput) searchInput.hidden = isToday;
  if (isToday) startTodayTicker();
  else stopTodayTicker();
}

function startTodayTicker() {
  stopTodayTicker();
  todayTicker = setInterval(() => {
    if (currentSection === 'sodien') updateContent();
  }, 60000);
}

function stopTodayTicker() {
  if (todayTicker) {
    clearInterval(todayTicker);
    todayTicker = null;
  }
}

function readJsonCache(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Cache write failed', error);
  }
}

async function getScheduleData(address) {
  const cacheKey = `schedules_${address}`;
  if (cachedSchedules[cacheKey]) {
    return cachedSchedules[cacheKey];
  }

  try {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`/api/schedules?address=${address}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      cachedSchedules[cacheKey] = data.schedules;
      writeJsonCache(`rvs_cache_clubs_${address}`, data.schedules);
      return data.schedules;
    } else if (response.status === 401) {
      logout();
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
  }

  const stored = readJsonCache(`rvs_cache_clubs_${address}`, null);
  if (stored) {
    usingOfflineCache = true;
    cachedSchedules[cacheKey] = stored;
    return stored;
  }
  return [];
}

async function getLessonTimesData(address) {
  const cacheKey = `lessonTimes_${address}`;
  if (cachedLessonTimes[cacheKey]) {
    return cachedLessonTimes[cacheKey];
  }

  try {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`/api/lesson-times?address=${address}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      cachedLessonTimes[cacheKey] = data.lessonTimes;
      writeJsonCache(`rvs_cache_lessons_${address}`, data.lessonTimes);
      return data.lessonTimes;
    } else if (response.status === 401) {
      logout();
      return {};
    }
  } catch (error) {
    console.error('Failed to fetch lesson times:', error);
  }

  const stored = readJsonCache(`rvs_cache_lessons_${address}`, null);
  if (stored) {
    usingOfflineCache = true;
    cachedLessonTimes[cacheKey] = stored;
    return stored;
  }
  return {};
}

async function getKonsultacijasData(address) {
  const cacheKey = `konsultacijas_${address}`;
  if (cachedKonsultacijas[cacheKey]) {
    return cachedKonsultacijas[cacheKey];
  }

  try {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`/api/konsultacijas?address=${address}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      cachedKonsultacijas[cacheKey] = data.konsultacijas;
      writeJsonCache(`rvs_cache_konsult_${address}`, data.konsultacijas);
      return data.konsultacijas;
    } else if (response.status === 401) {
      logout();
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch konsultacijas:', error);
  }

  const stored = readJsonCache(`rvs_cache_konsult_${address}`, null);
  if (stored) {
    usingOfflineCache = true;
    cachedKonsultacijas[cacheKey] = stored;
    return stored;
  }
  return [];
}

function filterData(data, grade, query) {
  let filtered = data;
  if (grade) {
    // Extract the grade part from complex string (e.g., "7.b;7.klase;7.kl." -> "7.b")
    const gradePart = grade.split(';')[0];
    filtered = filtered.filter((item) =>
      item.classes.toLowerCase().includes(gradePart.toLowerCase())
    );
  }
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        tr(item.name).toLowerCase().includes(lowerQuery) ||
        item.teacher.toLowerCase().includes(lowerQuery) ||
        item.classes.toLowerCase().includes(lowerQuery)
    );
  }
  return filtered;
}

// Funkcija, lai filtrētu dienu laikus pa klasi (jauna)
function filterDayTime(dayString, grade, fullDayName) {
  if (!dayString) return '';
  if (!grade)
    return fullDayName
      ? `${trDay(fullDayName)}: ${trNote(dayString)}`
      : trNote(dayString);

  // Extract the grade part from complex string (e.g., "7.b;7.klase;7.kl." -> "7.b")
  const gradePart = grade.split(';')[0];

  const dayParts = dayString.split(':');
  let dayName;
  let timesStr;
  if (dayParts.length === 1) {
    dayName = fullDayName;
    timesStr = dayString.trim();
  } else {
    dayName = fullDayName; // Use the provided dayName for consistency
    timesStr = dayParts[1].trim();
  }
  const times = timesStr
    .split(';')
    .map((t) => t.trim())
    .filter((t) => t);
  const filteredTimes = times.filter((time) =>
    time.toLowerCase().includes(gradePart.toLowerCase())
  );
  if (filteredTimes.length === 0) return '';
  const modifiedTimes = filteredTimes.map((time) => {
    const index = time.indexOf(' (');
    if (index !== -1) {
      return time.substring(0, index) + ' (' + gradePart + ')';
    } else {
      return time;
    }
  });
  return `${trDay(dayName)}: ${trNote(modifiedTimes.join('; '))}`;
}

function classCode(gradeValue) {
  return (gradeValue || '').split(';')[0].trim();
}

function scheduleUpdatedLabel() {
  const el = document.querySelector('#mainContent .schedule-updated');
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function classWeekShareUrl() {
  const code = classCode(currentGrade);
  const url = new URL(location.origin + location.pathname);
  if (code) url.searchParams.set('klase', code);
  url.searchParams.set('adrese', currentAddress);
  return url.toString();
}

function syncClassWeekUrl() {
  if (document.body.classList.contains('public-view')) return;
  const url = new URL(location.href);
  const code = classCode(currentGrade);
  if (code) url.searchParams.set('klase', code);
  else url.searchParams.delete('klase');
  url.searchParams.set('adrese', currentAddress);
  const next = url.pathname + url.search;
  if (`${location.pathname}${location.search}` !== next) {
    history.replaceState({}, '', next);
  }
}

function clearShareParams() {
  const url = new URL(location.href);
  if (!url.searchParams.has('klase') && !url.searchParams.has('adrese')) {
    return;
  }
  history.replaceState({}, '', url.pathname);
}

function applyShareLinkFromUrl() {
  const params = new URLSearchParams(location.search);
  const klase = (params.get('klase') || '').trim();
  const adrese = params.get('adrese');
  if (adrese === 'K' || adrese === 'Š') {
    currentAddress = adrese;
    localStorage.setItem(PREF_ADDRESS, adrese);
    applyAddressToggle();
    generateGradeOptions(currentAddress);
  }
  if (!klase) {
    updateMyClassChip();
    return;
  }
  const select = document.getElementById('grade-select');
  if (select) {
    const wanted = klase.toLowerCase();
    const match = Array.from(select.options).find((option) => {
      const value = option.value.toLowerCase();
      const code = option.value.split(';')[0].trim().toLowerCase();
      return value === wanted || code === wanted;
    });
    if (match) {
      select.value = match.value;
      currentGrade = match.value;
      localStorage.setItem(gradePrefKey(currentAddress), currentGrade);
    }
  }
  currentSection = 'stundu';
  const stunduRadio = document.getElementById('stundu-radio');
  if (stunduRadio) stunduRadio.checked = true;
  syncSectionChrome();
  updateMyClassChip();
}

function showShareToast(message) {
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showShareToast._timer);
  showShareToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

function printClassWeek() {
  const code = classCode(currentGrade);
  const previousTitle = document.title;
  if (code) document.title = `${code} ${t('week')} — ${t('schoolName')}`;
  window.print();
  setTimeout(() => {
    document.title = previousTitle;
  }, 500);
}

async function shareClassWeek() {
  const code = classCode(currentGrade);
  if (!code) {
    showShareToast(t('pickClassFirst'));
    return;
  }
  const url = classWeekShareUrl();
  const title = `${code} ${t('week')}`;
  const text = `${t('schoolName')} · ${code} ${t('week')} · ${campusLabel(currentAddress)}`;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    showShareToast(t('linkCopied'));
  } catch (error) {
    showShareToast(url);
  }
}

function bindPrintShareButtons() {
  const printBtn = document.getElementById('print-week-btn');
  const shareBtn = document.getElementById('share-week-btn');
  if (printBtn) printBtn.addEventListener('click', printClassWeek);
  if (shareBtn) shareBtn.addEventListener('click', shareClassWeek);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getLatvianToday(date = new Date()) {
  const day = date.getDay();
  const lessonDays = [
    null,
    'Pirmdiena',
    'Otrdiena',
    'Trešdiena',
    'Ceturtdiena',
    'Piektdiena',
  ];
  const clubDays = [
    null,
    'pirmdiena',
    'otrdiena',
    'tresdiena',
    'ceturtdiena',
    'piektdiena',
  ];
  if (day === 0 || day === 6) {
    return {
      isSchoolDay: false,
      lessonDay: 'Pirmdiena',
      clubDay: 'pirmdiena',
      label: 'Pirmdiena',
    };
  }
  return {
    isSchoolDay: true,
    lessonDay: lessonDays[day],
    clubDay: clubDays[day],
    label: lessonDays[day],
  };
}

function parseLessonRange(laiks) {
  if (!laiks) return null;
  const match = String(laiks).match(
    /(\d{1,2})\.(\d{2})\s*-\s*(\d{1,2})\.(\d{2})/
  );
  if (!match) return null;
  return {
    startMin: Number(match[1]) * 60 + Number(match[2]),
    endMin: Number(match[3]) * 60 + Number(match[4]),
    startLabel: `${match[1].padStart(2, '0')}.${match[2]}`,
    endLabel: `${match[3].padStart(2, '0')}.${match[4]}`,
  };
}

function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function teacherKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function teacherDisplay(name) {
  return String(name || '')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

function preferTeacherDisplay(current, candidate) {
  const pretty = teacherDisplay(candidate);
  if (!current) return pretty;
  const currentCaps = (current.match(/[A-ZĀČĒĢĪĶĻŅŠŪŽ]/g) || []).length;
  const nextCaps = (pretty.match(/[A-ZĀČĒĢĪĶĻŅŠŪŽ]/g) || []).length;
  return nextCaps > currentCaps ? pretty : current;
}

function addUniqueTeacher(map, raw) {
  splitPairedParts(raw).forEach((part) => {
    const key = teacherKey(part);
    if (!key) return;
    map.set(key, preferTeacherDisplay(map.get(key), part));
  });
}

function teacherMatches(field, query) {
  if (!query) return true;
  if (!field) return false;
  const needle = teacherKey(query);
  const needleRaw = query.toLowerCase().trim();
  if (!needle && !needleRaw) return true;
  return splitPairedParts(field).some((part) => {
    const key = teacherKey(part);
    return (
      (needle && key.includes(needle)) ||
      part.toLowerCase().includes(needleRaw)
    );
  });
}

function splitPairedParts(value) {
  if (value == null || value === '') return [];
  return String(value)
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function expandLessonGroups(lesson) {
  const teachers = splitPairedParts(lesson.skolotājs || lesson.teacher);
  const rooms = splitPairedParts(lesson.telpa || lesson.room);
  const subjects = splitPairedParts(lesson.nosaukums || lesson.subject);
  const count = Math.max(teachers.length, rooms.length, subjects.length, 1);
  const groups = [];
  for (let i = 0; i < count; i += 1) {
    groups.push({
      subject:
        subjects[i] ||
        subjects[0] ||
        lesson.nosaukums ||
        lesson.subject ||
        '',
      teacher:
        teachers[i] ||
        teachers[0] ||
        lesson.skolotājs ||
        lesson.teacher ||
        '',
      room: rooms[i] || rooms[0] || lesson.telpa || lesson.room || '',
    });
  }
  return groups;
}

function textIncludes(field, query) {
  if (!query) return true;
  if (!field) return false;
  return field.toLowerCase().includes(query.toLowerCase().trim());
}

function clubMatches(sourceName, query) {
  if (!query) return true;
  return (
    textIncludes(sourceName, query) || textIncludes(tr(sourceName), query)
  );
}

function isMealName(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return (
    lower.includes('pusdien') || lower.includes('launag') || name.includes('*')
  );
}

function hasAnyTodayFilter() {
  return Boolean(
    classCode(currentGrade) ||
      currentFilterTeacher ||
      currentFilterRoom ||
      currentFilterClub
  );
}

function getTodayFilters() {
  return {
    class: classCode(currentGrade),
    teacher: currentFilterTeacher.trim(),
    room: currentFilterRoom.trim(),
    club: currentFilterClub.trim(),
  };
}

function eventMatchesFilters(event, filters) {
  if (filters.class) {
    const cls = (event.grade || event.classes || '').toLowerCase();
    if (!cls.includes(filters.class.toLowerCase())) return false;
  }
  if (filters.teacher && !teacherMatches(event.teacher, filters.teacher)) {
    return false;
  }
  if (
    filters.room &&
    !textIncludes(event.room, filters.room) &&
    !textIncludes(event.location, filters.room)
  ) {
    return false;
  }
  if (filters.club) {
    if (!clubMatches(event.subject, filters.club)) return false;
  }
  return true;
}

function clubDayValue(item, clubDay) {
  if (item[clubDay]) return item[clubDay];
  if (clubDay === 'tresdiena' && item.trešdiena) return item.trešdiena;
  return '';
}

function collectTodayEvents(lessonData, clubs, konsultacijas, dayInfo, filters) {
  const events = [];
  const teacherOnly = Boolean(filters.teacher && !filters.class);

  Object.keys(lessonData || {}).forEach((grade) => {
    const dayLessons = lessonData[grade]?.[dayInfo.lessonDay] || [];
    dayLessons.forEach((lesson) => {
      const name = lesson.nosaukums || '';
      if (!name) return;
      if (teacherOnly && isMealName(name)) return;
      const range = parseLessonRange(lesson.laiks);
      expandLessonGroups(lesson).forEach((group) => {
        if (!group.subject) return;
        const event = {
          type: 'stunda',
          subject: group.subject,
          teacher: group.teacher,
          room: group.room,
          location: '',
          grade,
          classes: grade,
          period: lesson.stunda || '',
          time: lesson.laiks || '',
          startMin: range?.startMin ?? null,
          endMin: range?.endMin ?? null,
        };
        if (eventMatchesFilters(event, filters)) events.push(event);
      });
    });
  });

  (clubs || []).forEach((item) => {
    const dayString = clubDayValue(item, dayInfo.clubDay);
    if (!dayString) return;
    const slots = dayString
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean);
    slots.forEach((slot) => {
      const range = parseLessonRange(slot);
      const event = {
        type: 'pulcins',
        subject: item.name || '',
        teacher: item.teacher || '',
        room: item.telpa || '',
        location: item.location || '',
        grade: item.classes || '',
        classes: item.classes || '',
        period: '',
        time: slot,
        startMin: range?.startMin ?? null,
        endMin: range?.endMin ?? null,
      };
      if (eventMatchesFilters(event, filters)) events.push(event);
    });
  });

  (konsultacijas || []).forEach((item) => {
    const dayString = clubDayValue(item, dayInfo.clubDay);
    if (!dayString) return;
    const range = parseLessonRange(dayString);
    const event = {
      type: 'konsultacija',
      subject: item.name || 'Konsultācija',
      teacher: item.teacher || '',
      room: item.telpa || '',
      location: item.location || '',
      grade: item.classes || '',
      classes: item.classes || '',
      period: '',
      time: dayString,
      startMin: range?.startMin ?? null,
      endMin: range?.endMin ?? null,
    };
    if (eventMatchesFilters(event, filters)) events.push(event);
  });

  events.sort((a, b) => {
    if (a.startMin == null && b.startMin == null) return 0;
    if (a.startMin == null) return 1;
    if (b.startMin == null) return -1;
    return a.startMin - b.startMin;
  });
  return events;
}

function classifyTimeline(events, nowMin) {
  const timed = events.filter((event) => event.startMin != null);
  let current = null;
  let next = null;
  let status = 'empty';
  for (let i = 0; i < timed.length; i += 1) {
    const event = timed[i];
    if (nowMin >= event.startMin && nowMin < event.endMin) {
      current = event;
      next = timed[i + 1] || null;
      status = 'now';
      break;
    }
    if (nowMin < event.startMin) {
      next = event;
      status = i === 0 ? 'before' : 'gap';
      break;
    }
  }
  if (!current && !next && timed.length) status = 'after';
  else if (!timed.length) status = 'empty';
  return { current, next, status };
}

function isEventNow(event, nowMin = nowMinutes()) {
  return (
    event.startMin != null &&
    event.endMin != null &&
    nowMin >= event.startMin &&
    nowMin < event.endMin
  );
}

function fillDatalist(id, values, translateValues = false) {
  const list = document.getElementById(id);
  if (!list) return;
  const locale =
    window.RVS_I18N && window.RVS_I18N.getLanguage() === 'en' ? 'en' : 'lv';
  const unique = Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((value) => (translateValues ? tr(value) : value))
    )
  ).sort((a, b) => a.localeCompare(b, locale));
  list.innerHTML = unique
    .map((value) => `<option value="${escapeHtml(value)}"></option>`)
    .join('');
}

function fillFilterDatalists(lessonData, clubs, konsultacijas) {
  const teachers = new Map();
  const rooms = new Set();
  const clubNames = new Set();

  Object.values(lessonData || {}).forEach((gradeData) => {
    Object.values(gradeData || {}).forEach((dayLessons) => {
      (dayLessons || []).forEach((lesson) => {
        if (lesson.skolotājs) addUniqueTeacher(teachers, lesson.skolotājs);
        if (lesson.telpa) {
          lesson.telpa.split('/').forEach((part) => {
            const room = part.trim();
            if (room) rooms.add(room);
          });
        }
      });
    });
  });

  (clubs || []).forEach((item) => {
    if (item.teacher) addUniqueTeacher(teachers, item.teacher);
    if (item.telpa) rooms.add(item.telpa.trim());
    if (item.name) clubNames.add(item.name.trim());
  });
  (konsultacijas || []).forEach((item) => {
    if (item.teacher) addUniqueTeacher(teachers, item.teacher);
    if (item.telpa) rooms.add(item.telpa.trim());
  });

  fillDatalist('teacher-options', Array.from(teachers.values()));
  fillDatalist('room-options', Array.from(rooms));
  fillDatalist('club-options', Array.from(clubNames), true);
}

function campusLabel(address) {
  return address === 'Š' ? 'Ezera iela 5' : 'Parka iela 12';
}

function typeLabel(type) {
  if (type === 'pulcins') return t('typeClub');
  if (type === 'konsultacija') return t('typeConsult');
  return t('typeLesson');
}

const WEEK_DAYS = [
  'Pirmdiena',
  'Otrdiena',
  'Trešdiena',
  'Ceturtdiena',
  'Piektdiena',
];

function toPeriodEvent(lesson) {
  const range = parseLessonRange(lesson.time || lesson.laiks);
  return {
    type: lesson.type || 'stunda',
    subject: lesson.subject || lesson.nosaukums || '',
    teacher: lesson.teacher || lesson.skolotājs || '',
    room: lesson.room || lesson.telpa || '',
    grade: lesson.grade || '',
    time: lesson.time || lesson.laiks || '',
    day: lesson.day || '',
    startMin: range?.startMin ?? null,
    endMin: range?.endMin ?? null,
  };
}

function renderTeacherWeekView(items, teacherName) {
  const events = items
    .map(toPeriodEvent)
    .filter((event) => event.subject && !isMealName(event.subject));

  const classFilter = classCode(currentGrade);
  const filtered = classFilter
    ? events.filter((event) =>
        String(event.grade || '')
          .toLowerCase()
          .includes(classFilter.toLowerCase())
      )
    : events;

  const today = getLatvianToday();
  const nowMin = nowMinutes();
  const heroBits = [
    teacherName,
    classFilter,
    campusLabel(currentAddress),
  ].filter(Boolean);

  let html = `<div class="today-view">
    <header class="today-hero">
      <h2>${escapeHtml(teacherName || t('teacher'))} · ${t('week')}</h2>
      <p>${heroBits.map(escapeHtml).join(' · ')}</p>
    </header>`;

  if (!filtered.length) {
    html += `<p class="today-empty">${t('noLessonsFilter')}</p></div>`;
    return html;
  }

  WEEK_DAYS.forEach((day) => {
    const dayEvents = filtered
      .filter((event) => event.day === day)
      .sort((a, b) => {
        if (a.startMin == null && b.startMin == null) return 0;
        if (a.startMin == null) return 1;
        if (b.startMin == null) return -1;
        return a.startMin - b.startMin;
      });
    if (!dayEvents.length) return;

    const isToday = today.isSchoolDay && today.lessonDay === day;
    const { current } = isToday
      ? classifyTimeline(dayEvents, nowMin)
      : { current: null };

    html += `<section class="today-section today-week-day${isToday ? ' is-today' : ''}">
      <h3>${escapeHtml(trDay(day))}${isToday ? ` · ${t('todaySuffix')}` : ''}</h3>`;
    dayEvents.forEach((event) => {
      const past = isToday && event.endMin != null && nowMin >= event.endMin;
      const extra = isEventNow(event, nowMin)
        ? 'is-now'
        : past
          ? 'is-past'
          : '';
      html += renderPeriodCard(event, extra);
    });
    html += `</section>`;
  });

  html += `</div>`;
  return html;
}

async function renderTeacherWeekFromFilters() {
  const lessonData = await getLessonTimesData(currentAddress);
  const query = currentFilterTeacher || currentQuery;
  const items = searchTeacherInLessons(lessonData, query);
  return renderTeacherWeekView(items, query);
}

function renderPeriodCard(event, extraClass = '') {
  const time = event.time || '';
  return `
    <article class="today-period ${extraClass}">
      <div class="today-period-time">${escapeHtml(time)}</div>
      <div class="today-period-body">
        <div class="today-period-title">${escapeHtml(tr(event.subject || ''))}</div>
        <div class="today-period-meta">
          ${event.grade ? `<span>${escapeHtml(classCode(event.grade) || event.grade)}</span>` : ''}
          ${event.room ? `<span>${escapeHtml(event.room)}</span>` : ''}
          ${event.teacher ? `<span>${escapeHtml(event.teacher)}</span>` : ''}
          <span class="today-period-type">${typeLabel(event.type)}</span>
        </div>
      </div>
    </article>
  `;
}

function statusBanner(status, current, next, isSchoolDay) {
  if (!isSchoolDay) {
    return `<p class="today-banner">${t('notSchoolDay')}</p>`;
  }
  if (status === 'before' && next) {
    return `<p class="today-banner">${t('starts')} ${escapeHtml(next.time)} · ${escapeHtml(tr(next.subject))}</p>`;
  }
  if (status === 'gap' && next) {
    return `<p class="today-banner">${t('break')} · ${t('next')} ${escapeHtml(next.time)} · ${escapeHtml(tr(next.subject))}</p>`;
  }
  if (status === 'after') {
    return `<p class="today-banner">${t('dayOver')}</p>`;
  }
  if (status === 'now' && current) {
    return `<p class="today-banner today-banner-now">${t('now')} · ${escapeHtml(tr(current.subject))}</p>`;
  }
  return '';
}

async function renderTodayView() {
  usingOfflineCache = false;
  const noResultsDiv = document.getElementById('noResults');
  if (noResultsDiv) noResultsDiv.classList.add('hidden');

  const [lessonData, clubs, konsultacijas] = await Promise.all([
    getLessonTimesData(currentAddress),
    getScheduleData(currentAddress),
    getKonsultacijasData(currentAddress),
  ]);
  fillFilterDatalists(lessonData, clubs, konsultacijas);

  const filters = getTodayFilters();
  if (!hasAnyTodayFilter()) {
    return `
      <div class="today-view">
        <div class="today-empty">
          ${t('pickFilter')}
        </div>
      </div>
    `;
  }

  const dayInfo = getLatvianToday();
  const events = collectTodayEvents(
    lessonData,
    clubs,
    konsultacijas,
    dayInfo,
    filters
  );
  const { current, next, status } = classifyTimeline(events, nowMinutes());

  const heroBits = [
    filters.teacher,
    filters.class,
    filters.room,
    filters.club,
    campusLabel(currentAddress),
  ].filter(Boolean);

  const lessons = events.filter((event) => event.type === 'stunda');
  const todayClubs = events.filter((event) => event.type === 'pulcins');
  const todayKonsult = events.filter((event) => event.type === 'konsultacija');

  const heading = dayInfo.isSchoolDay
    ? t('todayHeading', { day: trDay(dayInfo.label) })
    : t('mondayPreview');

  let html = `<div class="today-view">`;
  if (usingOfflineCache) {
    html += `<p class="today-offline">${t('offlineCache')}</p>`;
  }
  html += `
    <header class="today-hero">
      <h2>${heading}</h2>
      <p>${heroBits.map(escapeHtml).join(' · ')}</p>
    </header>
    ${statusBanner(status, current, next, dayInfo.isSchoolDay)}
  `;

  if (current && dayInfo.isSchoolDay) {
    html += renderPeriodCard(current, 'is-now');
  }
  if (next && status !== 'before') {
    html += `<p class="today-next">${t('nextCap')} · ${escapeHtml(next.time)} · ${escapeHtml(tr(next.subject))}${next.grade ? ` · ${escapeHtml(classCode(next.grade) || next.grade)}` : ''}</p>`;
  }

  if (lessons.length) {
    html += `<section class="today-section"><h3>${t('lessonsToday')}</h3>`;
    html += lessons
      .map((event) =>
        renderPeriodCard(
          event,
          isEventNow(event)
            ? 'is-now'
            : event.endMin != null && nowMinutes() >= event.endMin
              ? 'is-past'
              : ''
        )
      )
      .join('');
    html += `</section>`;
  }

  html += `<section class="today-section"><h3>${t('clubsToday')}</h3>`;
  html += todayClubs.length
    ? todayClubs.map((event) => renderPeriodCard(event)).join('')
    : `<p class="today-muted">${t('noFilterMatch')}</p>`;
  html += `</section>`;

  html += `<section class="today-section"><h3>${t('consultToday')}</h3>`;
  html += todayKonsult.length
    ? todayKonsult.map((event) => renderPeriodCard(event)).join('')
    : `<p class="today-muted">${t('noFilterMatch')}</p>`;
  html += `</section>`;

  if (!events.length) {
    html += `<p class="today-empty">${t('noTodayEntries')}</p>`;
  }

  html += `<p class="today-actions"><button type="button" class="today-week-btn" id="today-week-btn">${t('seeWholeWeek')}</button></p>`;
  html += `</div>`;
  return html;
}

function openWeekFromToday() {
  currentSection = 'stundu';
  const stunduRadio = document.getElementById('stundu-radio');
  if (stunduRadio) stunduRadio.checked = true;
  syncSectionChrome();
  if (currentFilterTeacher) {
    const searchInput = document.getElementById('searchInput');
    currentQuery = currentFilterTeacher;
    if (searchInput) searchInput.value = currentFilterTeacher;
    performSearch(currentFilterTeacher);
    return;
  }
  updateContent();
}

async function updateContent() {
  let title;
  let data;
  let noResultsDiv;
  let contentDiv;
  noResultsDiv = document.getElementById('noResults');
  contentDiv = document.getElementById('content');

  if (currentSection === 'sodien') {
    if (contentDiv) contentDiv.innerHTML = await renderTodayView();
    const weekBtn = document.getElementById('today-week-btn');
    if (weekBtn) weekBtn.addEventListener('click', openWeekFromToday);
    return;
  }

  if (currentSection === 'pulcins') {
    data = await getScheduleData(currentAddress);
    if (currentQuery) {
      data = filterData(data, '', currentQuery);
    }
    if (currentGrade) {
      const gradePart = currentGrade.split(';')[0];
      data = data.filter((item) => {
        const days = [
          'pirmdiena',
          'otrdiena',
          'tresdiena',
          'ceturtdiena',
          'piektdiena',
        ];
        return days.some((day) => {
          const dayString = item[day];
          if (!dayString) return false;
          return dayString.toLowerCase().includes(gradePart.toLowerCase());
        });
      });
    }
    title =
      currentGrade || currentQuery
        ? `${currentGrade || ''} ${currentQuery || ''} - Pulciņu laiki`
        : `Visas klases - Pulciņu laiki (${currentAddress})`;
  } else if (currentSection === 'stundu') {
    title = currentFilterTeacher
      ? `${currentFilterTeacher} - Stundu saraksts (${currentAddress})`
      : currentGrade
        ? `${currentGrade} klase - Stundu saraksts (${currentAddress})`
        : `Stundu saraksts (${currentAddress})`;
  } else if (currentSection === 'konsultaciju') {
    data = filterData(
      await getKonsultacijasData(currentAddress),
      currentGrade,
      currentQuery
    );
    title =
      currentGrade || currentQuery
        ? `${currentGrade || ''} ${currentQuery || ''} - Konsultāciju laiki`
        : `Visas klases - Konsultāciju laiki (${currentAddress})`;
  }

  let html = '';
  if (currentSection === 'stundu') {
    html = currentFilterTeacher
      ? await renderTeacherWeekFromFilters()
      : await renderLessonTable();
  } else if (currentSection === 'konsultaciju') {
    if (data.length === 0) {
      noResultsDiv.classList.remove('hidden');
      contentDiv.innerHTML = '';
      return;
    }
    noResultsDiv.classList.add('hidden');
    html = data
      .map((item) => {
        return `
                <div class="card">
                    <h3>${escapeHtml(tr(item.name))}</h3>
                    <div class="sub-card">
                        <div class="teacher">${t('teacherLabel')}: ${item.teacher || 'TBD'}</div>
                        <div class="location">${t('placeLabel')}: ${item.location}</div>
                        ${item.telpa ? `<div class="location">${t('roomLabel')}: ${item.telpa}</div>` : ''}
                        ${item.hours ? `<div class="hours">${t('hoursLabel')}: ${item.hours}</div>` : ''}
                        ${currentGrade && item.classes ? `<div class="classes">${t('classesLabel')}: ${currentGrade}</div>` : item.classes ? `<div class="classes">${t('classesLabel')}: ${item.classes}</div>` : ''}
                        ${item.pirmdiena ? `<div class="day">${trDay('Pirmdiena')}: ${trNote(item.pirmdiena)}</div>` : ''}
                        ${item.otrdiena ? `<div class="day">${trDay('Otrdiena')}: ${trNote(item.otrdiena)}</div>` : ''}
                        ${item.tresdiena ? `<div class="day">${trDay('Trešdiena')}: ${trNote(item.tresdiena)}</div>` : ''}
                        ${item.ceturtdiena ? `<div class="day">${trDay('Ceturtdiena')}: ${trNote(item.ceturtdiena)}</div>` : ''}
                        ${item.piektdiena ? `<div class="day">${trDay('Piektdiena')}: ${trNote(item.piektdiena)}</div>` : ''}
                    </div>
                </div>
            `;
      })
      .join('');
  } else {
    // pulcins
    if (data.length === 0) {
      noResultsDiv.classList.remove('hidden');
      contentDiv.innerHTML = '';
      return;
    }
    noResultsDiv.classList.add('hidden');
    html = data
      .map((item) => {
        // Saglabā filtrētos laikus (izvairās no dubultas izsaukšanas)
        const pirmdienaFiltered = filterDayTime(
          item.pirmdiena,
          currentGrade,
          'Pirmdiena'
        );
        const otrdienaFiltered = filterDayTime(
          item.otrdiena,
          currentGrade,
          'Otrdiena'
        );
        const tresdienaFiltered = filterDayTime(
          item.tresdiena,
          currentGrade,
          'Trešdiena'
        );
        const ceturtdienaFiltered = filterDayTime(
          item.ceturtdiena,
          currentGrade,
          'Ceturtdiena'
        );
        const piektdienaFiltered = filterDayTime(
          item.piektdiena,
          currentGrade,
          'Piektdiena'
        );

        return `
                <div class="card">
                    <h3>${escapeHtml(tr(item.name))}</h3>
                    <div class="sub-card">
                        <div class="teacher">${t('teacherLabel')}: ${item.teacher || 'TBD'}</div>
                        <div class="location">${t('placeLabel')}: ${item.location}</div>
                        ${item.telpa ? `<div class="location">${t('roomLabel')}: ${item.telpa}</div>` : ''}
                        ${item.hours ? `<div class="hours">${t('hoursLabel')}: ${item.hours}</div>` : ''}
                        ${currentGrade && item.classes ? `<div class="classes">${t('classesLabel')}: ${currentGrade}</div>` : item.classes ? `<div class="classes">${t('classesLabel')}: ${item.classes}</div>` : ''}
                        ${pirmdienaFiltered ? `<div class="day">${pirmdienaFiltered}</div>` : ''}
                        ${otrdienaFiltered ? `<div class="day">${otrdienaFiltered}</div>` : ''}
                        ${tresdienaFiltered ? `<div class="day">${tresdienaFiltered}</div>` : ''}
                        ${ceturtdienaFiltered ? `<div class="day">${ceturtdienaFiltered}</div>` : ''}
                        ${piektdienaFiltered ? `<div class="day">${piektdienaFiltered}</div>` : ''}
                    </div>
                </div>
            `;
      })
      .join('');
  }

  contentDiv.innerHTML = html;
  bindPrintShareButtons();
  syncClassWeekUrl();
}
async function renderLessonTable() {
  const timesData = await getLessonTimesData(currentAddress);
  const days = [
    'Pirmdiena',
    'Otrdiena',
    'Trešdiena',
    'Ceturtdiena',
    'Piektdiena',
  ];
  let html = '';

  if (!currentGrade) {
    html += `<p>${t('pickClass')}</p>`;
    return html;
  }

  // Extract the grade part from complex string (e.g., "2.a;2.klase;2.kl." -> "2.a")
  const gradeKey = currentGrade.split(';')[0];
  const gradeData = timesData[gradeKey];
  if (!gradeData) {
    html += `<p>${t('noClassData')}</p>`;
    return html;
  }

  const code = classCode(currentGrade) || gradeKey;
  const updated = scheduleUpdatedLabel();
  const shareLabel =
    typeof navigator.share === 'function' ? t('share') : t('copyLink');
  html = `<div class="print-week" id="print-week">
    <header class="print-week-hero">
      <h2>${escapeHtml(code)} ${t('week')}</h2>
      <p>${escapeHtml(campusLabel(currentAddress))} · ${t('semester2')}${updated ? ` · ${escapeHtml(updated)}` : ''}</p>
      <div class="print-week-actions">
        <button type="button" id="print-week-btn">${t('print')}</button>
        <button type="button" id="share-week-btn">${shareLabel}</button>
      </div>
    </header>
    <div class="table-scroll">`;
  for (const day of days) {
    const selectedData = gradeData[day] || [];
    const lessons = selectedData.length || 8;

    html += `<h3>${escapeHtml(trDay(day))}</h3>`;
    html += '<table class="lesson-table">';
    html +=
      `<thead><tr><th>${t('colPeriod')}</th><th>${t('colTime')}</th><th>${t('colSubject')}</th><th>${t('colRoom')}</th><th>${t('colTeacher')}</th></tr></thead><tbody>`;

    for (let i = 0; i < lessons; i++) {
      html += '<tr>';

      const row = selectedData[i];
      if (row) {
        const groups = expandLessonGroups(row);
        const subjects = groups.map((g) => escapeHtml(tr(g.subject))).join('<br>');
        const rooms = groups.map((g) => escapeHtml(g.room)).join('<br>');
        const teachers = groups.map((g) => escapeHtml(g.teacher)).join('<br>');
        html += `<td>${escapeHtml(row.stunda || '')}</td><td>${escapeHtml(row.laiks || '')}</td><td>${subjects}</td><td>${rooms}</td><td>${teachers}</td>`;
      } else {
        html += `<td>${i + 1}</td><td></td><td></td><td></td><td></td>`;
      }

      html += '</tr>';
    }

    html += '</tbody></table>';
  }
  html += '</div></div>';

  return html;
}

function handleAddressToggle() {
  const toggle = document.getElementById('address-toggle');
  currentAddress = toggle.checked ? 'K' : 'Š';
  localStorage.setItem(PREF_ADDRESS, currentAddress);
  generateGradeOptions(currentAddress);
  const savedGrade = localStorage.getItem(gradePrefKey(currentAddress)) || '';
  const select = document.getElementById('grade-select');
  if (select) {
    const exists = Array.from(select.options).some((o) => o.value === savedGrade);
    if (exists) {
      select.value = savedGrade;
      currentGrade = savedGrade;
    } else {
      select.value = '';
      currentGrade = '';
    }
  }
  updateMyClassChip();
  syncClassWeekUrl();
  updateContent();
}

function handleSectionChange(e) {
  currentSection = e.target.value;
  syncSectionChrome();
  updateContent();
}

function handleGradeChange(e) {
  currentGrade = e.target.value;
  localStorage.setItem(gradePrefKey(currentAddress), currentGrade);
  updateMyClassChip();
  syncClassWeekUrl();
  updateContent();
}
function getRelevantDayTimes(dayName, dayTimes, grade) {
  if (!dayTimes) return '';
  if (!grade) {
    return `<div class="day">${trDay(dayName)}: ${trNote(dayTimes)}</div>`;
  }

  const normalizedGrade = grade.toLowerCase().replace('.', '');
  const parts = dayTimes.includes(';') ? dayTimes.split(';') : [dayTimes];
  const relevant = parts.filter((part) => {
    const normalizedPart = part
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[()]/g, '');
    return (
      normalizedPart.includes(normalizedGrade) ||
      normalizedPart.includes(grade.toLowerCase()) ||
      normalizedPart.includes(grade.replace('.', '').toLowerCase() + 'kl') ||
      normalizedPart.includes('kl' + normalizedGrade) ||
      (grade.match(/^(\d+)([a-z])$/) && normalizedPart.includes(`${grade}kl`))
    );
  });

  if (relevant.length > 0) {
    const combined = relevant.join('; ');
    return `<div class="day">${trDay(dayName)}: ${trNote(combined)}</div>`;
  }
  return '';
}

function getRelevantTimes(dayTimes, searchClass) {
  if (!dayTimes) return '';
  const parts = dayTimes.split(';');
  const relevant = parts.filter((part) =>
    part.toLowerCase().includes(searchClass.toLowerCase())
  );
  return relevant.join('; ') || '';
}

async function performSearch(query) {
  if (!query) {
    showAll();
    return;
  }
  const lowerQuery = query.toLowerCase();
  let results = [];
  let searchType = '';

  // Check if it's a room search
  const isRoomQuery =
    /\d+\.k/.test(lowerQuery) ||
    lowerQuery.includes('telpa') ||
    lowerQuery.includes('nodarb') ||
    lowerQuery.includes('room');
  if (isRoomQuery) {
    results = [];
    const konsultData = await getKonsultacijasData(currentAddress);
    const scheduleData = await getScheduleData(currentAddress);
    const lessonData = await getLessonTimesData(currentAddress);

    // For konsultacijas
    konsultData
      .filter(
        (item) =>
          (item.telpa && item.telpa.toLowerCase().includes(lowerQuery)) ||
          (item.location && item.location.toLowerCase().includes(lowerQuery))
      )
      .forEach((item) => {
        [
          'pirmdiena',
          'otrdiena',
          'tresdiena',
          'ceturtdiena',
          'piektdiena',
        ].forEach((day) => {
          if (item[day]) {
            results.push({
              teacher: item.teacher,
              grade: item.classes,
              subject: item.name,
              day: day.charAt(0).toUpperCase() + day.slice(1),
              time: item[day],
              type: 'konsultacija',
            });
          }
        });
      });

    // For schedules (pulcins)
    scheduleData
      .filter(
        (item) =>
          (item.telpa && item.telpa.toLowerCase().includes(lowerQuery)) ||
          (item.location && item.location.toLowerCase().includes(lowerQuery))
      )
      .forEach((item) => {
        [
          'pirmdiena',
          'otrdiena',
          'tresdiena',
          'ceturtdiena',
          'piektdiena',
        ].forEach((day) => {
          if (item[day]) {
            results.push({
              teacher: item.teacher,
              grade: item.classes,
              subject: item.name,
              day: day.charAt(0).toUpperCase() + day.slice(1),
              time: item[day],
              type: 'pulcins',
            });
          }
        });
      });

    // For lesson times
    Object.keys(lessonData).forEach((grade) => {
      const gradeData = lessonData[grade];
      Object.keys(gradeData).forEach((day) => {
        const dayLessons = gradeData[day];
        dayLessons.forEach((lesson) => {
          expandLessonGroups(lesson).forEach((group) => {
            if (group.room && group.room.toLowerCase().includes(lowerQuery)) {
              results.push({
                teacher: group.teacher,
                grade,
                subject: group.subject,
                day,
                time: lesson.laiks,
                room: group.room,
                type: 'stunda',
              });
            }
          });
        });
      });
    });

    if (results.length > 0) {
      // Sort results: first by day order, then by start time
      const dayOrder = [
        'Pirmdiena',
        'Otrdiena',
        'Trešdiena',
        'Ceturtdiena',
        'Piektdiena',
      ];
      const dayMapping = {
        pirmdiena: 'Pirmdiena',
        otrdiena: 'Otrdiena',
        tresdiena: 'Trešdiena',
        ceturtdiena: 'Ceturtdiena',
        piektdiena: 'Piektdiena',
      };
      results.forEach((item) => {
        item.day = dayMapping[item.day.toLowerCase()] || item.day;
      });
      results.sort((a, b) => {
        const dayA = dayOrder.indexOf(a.day);
        const dayB = dayOrder.indexOf(b.day);
        if (dayA !== dayB) return dayA - dayB;
        // Same day, sort by start time
        const timeA = a.time.split('-')[0];
        const timeB = b.time.split('-')[0];
        const [hA, mA] = timeA.split('.').map(Number);
        const [hB, mB] = timeB.split('.').map(Number);
        const minA = hA * 60 + mA;
        const minB = hB * 60 + mB;
        return minA - minB;
      });

      document.getElementById('noResults').classList.add('hidden');
      renderResults(results, 'room', query);
      return;
    } else {
      document.getElementById('content').innerHTML = '';
      document.getElementById('noResults').classList.remove('hidden');
      return;
    }
  }

  if (currentSection === 'stundu') {
    const lessonData = await getLessonTimesData(currentAddress);
    const teacherLessons = searchTeacherInLessons(lessonData, lowerQuery);

    if (teacherLessons.length > 0) {
      searchType = 'teacher_schedule';
      results = teacherLessons;
    } else {
      document.getElementById('content').innerHTML = '';
      document.getElementById('noResults').classList.remove('hidden');
      return;
    }
  } else {
    const data =
      currentSection === 'konsultaciju'
        ? await getKonsultacijasData(currentAddress)
        : await getScheduleData(currentAddress);

    if (data.some((item) => item.teacher.toLowerCase().includes(lowerQuery))) {
      searchType = 'teacher';
      results = data.filter((item) =>
        item.teacher.toLowerCase().includes(lowerQuery)
      );
    } else if (
      data.some((item) => clubMatches(item.name, lowerQuery))
    ) {
      searchType = 'club';
      results = data.filter((item) => clubMatches(item.name, lowerQuery));
    } else {
      searchType = 'class';
      const gradeMatch = lowerQuery.match(/(\d+)/);
      const exactClass = lowerQuery.replace(/\s*/g, '');
      const isSpecific = /[a-z]/.test(exactClass);
      if (gradeMatch) {
        const grade = gradeMatch[1];
        results = data.filter((item) => {
          const cls = item.classes.toLowerCase();
          if (isSpecific) {
            return cls.includes(exactClass);
          } else {
            return (
              cls.includes(exactClass) ||
              cls.includes(grade + '.') ||
              cls.includes(grade + '.-') ||
              cls.includes('.' + grade + '.') ||
              cls.includes(grade + ',')
            );
          }
        });
      } else {
        results = data.filter((item) =>
          item.classes.toLowerCase().includes(lowerQuery)
        );
      }
    }
  }

  if (results.length === 0) {
    document.getElementById('content').innerHTML = '';
    document.getElementById('noResults').classList.remove('hidden');
    return;
  }

  document.getElementById('noResults').classList.add('hidden');
  renderResults(results, searchType, query);
}

function searchTeacherInLessons(lessonData, teacherQuery) {
  const teacherLessons = [];
  const query = (teacherQuery || '').trim();
  if (!query) return teacherLessons;

  Object.keys(lessonData || {}).forEach((grade) => {
    const gradeData = lessonData[grade];
    Object.keys(gradeData || {}).forEach((day) => {
      (gradeData[day] || []).forEach((lesson) => {
        if (!lesson.nosaukums) return;
        if (isMealName(lesson.nosaukums)) return;
        expandLessonGroups(lesson).forEach((group) => {
          if (!teacherMatches(group.teacher, query)) return;
          teacherLessons.push({
            type: 'stunda',
            teacher: group.teacher,
            grade,
            day,
            subject: group.subject,
            time: lesson.laiks || '',
            room: group.room,
            period: lesson.stunda || '',
          });
        });
      });
    });
  });

  return teacherLessons;
}

function renderResults(items, searchType, query) {
  const resultsDiv = document.getElementById('content');
  let html = '';

  if (searchType === 'teacher_schedule') {
    const teacherName = currentFilterTeacher || items[0]?.teacher || query;
    html = renderTeacherWeekView(items, teacherName);
  } else if (searchType === 'class') {
    html += `<div class="card">
            <h3>${t('classClubs', { query })}</h3>
            ${items
              .map(
                (item) => `
                <div class="sub-card">
                    <div class="teacher">${t('teacherLabel')}: ${item.teacher || 'TBD'}</div>
                    <div class="name">${escapeHtml(tr(item.name))}</div>
                    <div class="location">${t('placeLabel')}: ${item.location}</div>
                    ${getRelevantTimes(item.pirmdiena || item.pirmdiena, query) ? `<div class="day">${trDay('Pirmdiena')}: ${trNote(getRelevantTimes(item.pirmdiena || item.pirmdiena, query))}</div>` : ''}
                    ${getRelevantTimes(item.otrdiena || item.otrdiena, query) ? `<div class="day">${trDay('Otrdiena')}: ${trNote(getRelevantTimes(item.otrdiena || item.otrdiena, query))}</div>` : ''}
                    ${getRelevantTimes(item.tresdiena || item.tresdiena, query) ? `<div class="day">${trDay('Trešdiena')}: ${trNote(getRelevantTimes(item.tresdiena || item.tresdiena, query))}</div>` : ''}
                    ${getRelevantTimes(item.ceturtdiena || item.ceturtdiena, query) ? `<div class="day">${trDay('Ceturtdiena')}: ${trNote(getRelevantTimes(item.ceturtdiena || item.ceturtdiena, query))}</div>` : ''}
                    ${getRelevantTimes(item.piektdiena || item.piektdiena, query) ? `<div class="day">${trDay('Piektdiena')}: ${trNote(getRelevantTimes(item.piektdiena || item.piektdiena, query))}</div>` : ''}
                </div>
            `
              )
              .join('')}
        </div>`;
  } else if (searchType === 'room') {
    html += `<div class="card">
            <h3>${t('roomSearch')}: ${query} (${currentAddress})</h3>
            ${items
              .map(
                (item) => `
                <div class="sub-card">
                    <div class="teacher">${t('teacherLabel')}: ${item.teacher || 'TBD'}</div>
                    <div class="grade">${t('classLabel')}: ${item.grade}</div>
                    <div class="subject">${t('subjectLabel')}: ${escapeHtml(tr(item.subject))}</div>
                    <div class="day">${escapeHtml(trDay(item.day))}</div>
                    <div class="time">${t('timeLabel')}: ${item.time}</div>
                </div>
            `
              )
              .join('')}
        </div>`;
  } else {
    const grouped = {};
    items.forEach((item) => {
      const key = searchType === 'teacher' ? item.teacher : item.name;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    Object.keys(grouped).forEach((key) => {
      const groupItems = grouped[key];
      const titleSuffix = t('allClassesTimes');
      html += `<div class="card">
                <h3>${escapeHtml(tr(key))} ${titleSuffix}</h3>
                ${groupItems
                  .map(
                    (item) => `
                    <div class="sub-card">
                        <div class="teacher">${t('teacherLabel')}: ${item.teacher || 'TBD'}</div>
                        <div class="name">${escapeHtml(tr(item.name))}</div>
                        <div class="location">${t('placeLabel')}: ${item.location}</div>
                        ${item.pirmdiena || item.pirmdiena ? `<div class="day">${trDay('Pirmdiena')}: ${trNote(item.pirmdiena || item.pirmdiena)}</div>` : ''}
                        ${item.otrdiena || item.otrdiena ? `<div class="day">${trDay('Otrdiena')}: ${trNote(item.otrdiena || item.otrdiena)}</div>` : ''}
                        ${item.tresdiena || item.tresdiena ? `<div class="day">${trDay('Trešdiena')}: ${trNote(item.tresdiena || item.tresdiena)}</div>` : ''}
                        ${item.ceturtdiena || item.ceturtdiena ? `<div class="day">${trDay('Ceturtdiena')}: ${trNote(item.ceturtdiena || item.ceturtdiena)}</div>` : ''}
                        ${item.piektdiena || item.piektdiena ? `<div class="day">${trDay('Piektdiena')}: ${trNote(item.piektdiena || item.piektdiena)}</div>` : ''}
                    </div>
                `
                  )
                  .join('')}
            </div>`;
    });
  }

  resultsDiv.innerHTML = html;
}

function showAll() {
  renderResults(getScheduleData(currentAddress), 'club', '');
}

function clearSelections() {
  currentFilterTeacher = '';
  currentFilterRoom = '';
  currentFilterClub = '';
  currentQuery = '';
  localStorage.removeItem(PREF_TEACHER);
  localStorage.removeItem(PREF_ROOM);
  localStorage.removeItem(PREF_CLUB);
  const teacherInput = document.getElementById('filter-teacher');
  const roomInput = document.getElementById('filter-room');
  const clubInput = document.getElementById('filter-club');
  const searchInput = document.getElementById('searchInput');
  if (teacherInput) teacherInput.value = '';
  if (roomInput) roomInput.value = '';
  if (clubInput) clubInput.value = '';
  if (searchInput) searchInput.value = '';
  const sodienRadio = document.getElementById('sodien-radio');
  if (sodienRadio) sodienRadio.checked = true;
  currentSection = 'sodien';
  syncSectionChrome();
  updateContent();
}

function themeToggleMarkup(isDark) {
  return isDark ? '☀️' : '🌙';
}

function syncThemeToggleButtons() {
  const isDark = document.body.classList.contains('dark-mode');
  const expected = themeToggleMarkup(isDark);
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    if ((btn.textContent || '').trim() !== expected) {
      btn.textContent = expected;
    }
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  });
}

function bindThemeToggle() {
  if (themeToggleBound) return;
  themeToggleBound = true;
  document.addEventListener('click', (e) => {
    if (e.target.closest('.theme-toggle')) toggleDarkMode();
  });
  const observer = new MutationObserver(() => syncThemeToggleButtons());
  observer.observe(document.body, { childList: true, subtree: true });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isNowDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isNowDark);
  syncThemeToggleButtons();
}

function openSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'block';
  loadSettingsToForm();
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';
}

function loadSettingsToForm() {
  const settings =
    JSON.parse(localStorage.getItem('accessibilitySettings')) || {};
  document.getElementById('bgColor').value = settings.bgColor || '#f9f9f9';
  document.getElementById('textColor').value =
    settings.textColor || 'rgba(51, 51, 51, 1)';
  document.getElementById('headerBg').value = settings.headerBg || '#1e3d28';
  document.getElementById('accentColor').value =
    settings.accentColor || '#7123a5';
  document.getElementById('borderColor').value = settings.borderColor || '#ddd';
  document.getElementById('cardBg').value = settings.cardBg || '#ffffff';
  document.getElementById('modalBg').value = settings.modalBg || '#fefefe';
  document.getElementById('fontFamily').value =
    settings.fontFamily || 'Arial, sans-serif';
  document.getElementById('fontSize').value = settings.fontSize || '16px';
}

function saveSettings(e) {
  e.preventDefault();
  const settings = {
    bgColor: document.getElementById('bgColor').value,
    textColor: document.getElementById('textColor').value,
    headerBg: document.getElementById('headerBg').value,
    accentColor: document.getElementById('accentColor').value,
    borderColor: document.getElementById('borderColor').value,
    cardBg: document.getElementById('cardBg').value,
    modalBg: document.getElementById('modalBg').value,
    fontFamily: document.getElementById('fontFamily').value,
    fontSize: document.getElementById('fontSize').value,
  };
  localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  applySettings(settings);
  closeSettings();
}

function resetSettings() {
  localStorage.removeItem('accessibilitySettings');
  const defaultSettings = {
    bgColor: '#f9f9f9',
    textColor: 'rgba(51, 51, 51, 1)',
    headerBg: '#1e3d28',
    accentColor: '#7123a5',
    borderColor: '#ddd',
    cardBg: '#ffffff',
    modalBg: '#fefefe',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
  };
  applySettings(defaultSettings);
  loadSettingsToForm();
}

function contrastingText(hex) {
  const raw = String(hex || '').replace('#', '');
  if (raw.length !== 6) return '#f3f6f2';
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#1a1a1a' : '#f3f6f2';
}

function applySettings(settings) {
  if (!settings) return;
  document.documentElement.style.setProperty('--bg-color', settings.bgColor);
  document.documentElement.style.setProperty(
    '--text-color',
    settings.textColor
  );
  document.documentElement.style.setProperty('--header-bg', settings.headerBg);
  document.documentElement.style.setProperty(
    '--header-text',
    contrastingText(settings.headerBg)
  );
  document.documentElement.style.setProperty(
    '--accent-color',
    settings.accentColor
  );
  document.documentElement.style.setProperty(
    '--secondary-accent',
    settings.accentColor
  );
  document.documentElement.style.setProperty(
    '--border-color',
    settings.borderColor
  );
  document.documentElement.style.setProperty('--card-bg', settings.cardBg);
  document.documentElement.style.setProperty('--modal-bg', settings.modalBg);
  document.documentElement.style.setProperty(
    '--custom-font-family',
    settings.fontFamily
  );
  document.documentElement.style.setProperty(
    '--custom-font-size',
    settings.fontSize
  );
  applySettingsToLessonFrames(settings);
}

function applySettingsToLessonFrames(settings) {
  const saved =
    settings ||
    JSON.parse(localStorage.getItem('accessibilitySettings') || 'null');
  if (!saved) return;
  document.querySelectorAll('iframe.lesson-iframe').forEach((frame) => {
    const paint = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.documentElement) return;
        doc.documentElement.style.setProperty(
          '--accent',
          saved.accentColor || saved.headerBg
        );
        if (doc.body) {
          doc.body.style.backgroundColor = saved.bgColor;
          doc.body.style.color = saved.textColor;
          if (saved.fontFamily) doc.body.style.fontFamily = saved.fontFamily;
          doc.documentElement.style.overflowY = 'auto';
          doc.body.style.overflowY = 'auto';
          doc.body.style.paddingBottom = '2.5rem';
        }
      } catch (error) {
        console.warn('Could not apply settings to lesson frame', error);
      }
    };
    if (frame.contentDocument?.readyState === 'complete') paint();
    frame.addEventListener('load', paint);
  });
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('accessibilitySettings'));
  if (settings) {
    const oldHeader = (settings.headerBg || '').toLowerCase();
    if (!oldHeader || oldHeader === '#1be357' || oldHeader === '#3d6b4f') {
      settings.headerBg = '#1e3d28';
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }
    applySettings(settings);
  }
}

function closeLogin() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.style.display = 'none';
  alert(t('enterPasswordAlert'));
}

function logout() {
  // Clear JWT token and user data
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');

  const mainContent = document.getElementById('mainContent');
  const loginModal = document.getElementById('loginModal');
  const loginError = document.getElementById('loginError');

  if (mainContent) mainContent.classList.add('hidden');
  clearShareParams();
  setPublicView(true);
  if (loginModal) loginModal.style.display = 'none';
  if (loginError) loginError.classList.add('hidden');
  stopTodayTicker();
}

// Keyboard navigation support for authenticated section
function handleKeyboardNavigation(event) {
  // Handle Escape key for closing modals
  if (event.key === 'Escape') {
    const loginModal = document.getElementById('loginModal');
    const settingsModal = document.getElementById('settingsModal');

    if (loginModal && loginModal.style.display !== 'none') {
      closeLogin();
    } else if (settingsModal && settingsModal.style.display !== 'none') {
      closeSettings();
    }
  }

  // Handle search with Enter key
  if (event.key === 'Enter' && event.target.id === 'searchInput') {
    event.preventDefault();
    updateContent();
  }

  // Handle radio button navigation with arrow keys
  const radioGroup = document.querySelector('.radio-group');
  if (radioGroup && radioGroup.contains(event.target)) {
    const radios = Array.from(
      document.querySelectorAll('input[name="section"]')
    );
    const currentIndex = radios.findIndex((radio) => radio.checked);

    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      event.preventDefault();
      radios[currentIndex - 1].checked = true;
      handleSectionChange({ target: radios[currentIndex - 1] });
    } else if (event.key === 'ArrowRight' && currentIndex < radios.length - 1) {
      event.preventDefault();
      radios[currentIndex + 1].checked = true;
      handleSectionChange({ target: radios[currentIndex + 1] });
    }
  }
}

// Add keyboard event listeners
document.addEventListener('keydown', handleKeyboardNavigation);

// Modal accessibility improvements
function improveModalAccessibility() {
  // Focus trap for modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  });
}

// Initialize modal accessibility when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', improveModalAccessibility);
} else {
  setTimeout(improveModalAccessibility, 100);
}

(function () {
  if (window.FlipBookNotes) return;

  const emptyPreview = () => t('notesPreview');

  function loadStoredNotes() {
    try {
      const raw = localStorage.getItem('flipbook-notes');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((note) => String(note)) : [];
    } catch (error) {
      console.warn('Pierakstus neizdevās nolasīt', error);
      return [];
    }
  }

  function previewText(noteText) {
    const trimmed = String(noteText || '')
      .replace(/\s+/g, ' ')
      .trim();
    return trimmed ? trimmed.substring(0, 100) : emptyPreview();
  }

  class FlipBookNotes {
    constructor() {
      this.notes = loadStoredNotes();
      this.container = null;
      this.notesList = null;
      this.isOpen = false;
      this.toggleBtn = null;
      this.init();
    }

    init() {
      this.createToggleButton();
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.hide();
      });
    }

    createToggleButton() {
      if (document.getElementById('flipbook-toggle')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'flipbook-toggle';
      button.className = 'flipbook-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'flipbook-notes');
      this.toggleBtn = button;
      this.syncToggleLabel();
      button.addEventListener('click', () => this.toggle());
      const host = document.getElementById('page-tools') || document.body;
      host.insertBefore(button, host.firstChild);
    }

    syncToggleLabel() {
      if (!this.toggleBtn) return;
      this.toggleBtn.textContent = this.isOpen ? '✕' : '📓';
      this.toggleBtn.setAttribute(
        'aria-label',
        this.isOpen ? t('notesClose') : t('notesOpen')
      );
      this.toggleBtn.title = this.isOpen ? t('notesClose') : t('notes');
      this.toggleBtn.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
    }

    toggle() {
      if (this.isOpen) this.hide();
      else this.show();
    }

    show() {
      if (!this.container) this.createContainer();
      this.container.style.display = 'block';
      this.isOpen = true;
      this.syncToggleLabel();
    }

    hide() {
      if (this.container) this.container.style.display = 'none';
      this.isOpen = false;
      this.syncToggleLabel();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.id = 'flipbook-notes';
      this.container.className = 'flipbook-notes';
      this.container.setAttribute('role', 'dialog');
      this.container.setAttribute('aria-label', t('notes'));

      const title = document.createElement('h3');
      title.className = 'flipbook-title';
      title.textContent = t('notes');

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'add-note';
      addBtn.textContent = t('notesAdd');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addNewNote();
      });

      const notesCont = document.createElement('div');
      notesCont.className = 'notes-container';
      this.notesList = notesCont;

      this.container.appendChild(title);
      this.container.appendChild(addBtn);
      this.container.appendChild(notesCont);

      document.body.appendChild(this.container);
      this.renderNotes();
    }

    addNewNote() {
      if (this.notes.length && String(this.notes[0]).trim() === '') {
        this.renderNotes();
        this.focusFirstEditor();
        return;
      }
      this.notes.unshift('');
      this.saveNotes();
      this.renderNotes();
      this.focusFirstEditor();
    }

    focusFirstEditor() {
      const card = this.notesList?.querySelector('.note-card');
      const first = card?.querySelector('.note-flipper');
      const textarea = card?.querySelector('.note-textarea');
      if (first) first.classList.add('flipped');
      if (card) card.classList.add('is-flipped');
      if (textarea) textarea.focus();
    }

    renderNotes() {
      if (!this.notesList) return;
      this.notesList.innerHTML = '';
      if (this.notes.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'notes-empty';
        empty.textContent = t('notesEmpty');
        this.notesList.appendChild(empty);
        return;
      }
      this.notes.forEach((note, index) => {
        this.notesList.appendChild(this.createNoteCard(note, index));
      });
    }

    createNoteCard(noteText, index) {
      const card = document.createElement('div');
      card.className = 'note-card';

      const flipper = document.createElement('div');
      flipper.className = 'note-flipper';

      const front = document.createElement('div');
      front.className = 'note-front';
      const preview = document.createElement('div');
      preview.className = 'note-preview';
      preview.textContent = previewText(noteText);
      front.appendChild(preview);

      const back = document.createElement('div');
      back.className = 'note-back';

      const textarea = document.createElement('textarea');
      textarea.className = 'note-textarea';
      textarea.placeholder = t('notesPlaceholder');
      textarea.value = noteText;
      let ignoreBlur = false;
      textarea.addEventListener('click', (e) => e.stopPropagation());
      textarea.addEventListener('pointerdown', (e) => e.stopPropagation());
      textarea.addEventListener('blur', () => {
        if (ignoreBlur || !textarea.isConnected) return;
        this.updateNote(index, textarea.value);
        preview.textContent = previewText(textarea.value);
        flipper.classList.remove('flipped');
        card.classList.remove('is-flipped');
      });
      back.appendChild(textarea);

      flipper.appendChild(front);
      flipper.appendChild(back);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-note';
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = t('notesDelete');
      deleteBtn.setAttribute('aria-label', t('notesDelete'));
      deleteBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        ignoreBlur = true;
      });
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        ignoreBlur = true;
        if (window.confirm(t('notesDeleteConfirm'))) {
          this.deleteNote(index);
        } else {
          ignoreBlur = false;
          textarea.focus();
        }
      });

      flipper.addEventListener('click', (e) => {
        if (e.target.closest('.delete-note') || e.target.closest('textarea')) {
          return;
        }
        flipper.classList.toggle('flipped');
        card.classList.toggle('is-flipped', flipper.classList.contains('flipped'));
        if (flipper.classList.contains('flipped')) {
          textarea.focus();
        }
      });

      card.appendChild(flipper);
      card.appendChild(deleteBtn);
      return card;
    }

    deleteNote(index) {
      this.notes.splice(index, 1);
      this.saveNotes();
      this.renderNotes();
    }

    updateNote(index, text) {
      this.notes[index] = text;
      this.saveNotes();
    }

    saveNotes() {
      localStorage.setItem('flipbook-notes', JSON.stringify(this.notes));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.FlipBookNotes = new FlipBookNotes();
    });
  } else {
    window.FlipBookNotes = new FlipBookNotes();
  }
})();

async function checkAuthStatus() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return false;

  try {
    const response = await fetch('/api/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) return false;
      return true;
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('Token verification error:', error);
    return true;
  }
}
