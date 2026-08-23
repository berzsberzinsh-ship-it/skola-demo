(function (global) {
  const PREF_LANG = 'rvs_lang';
  const listeners = [];

  const STRINGS = {
    lv: {
      schoolName: 'Tests skola',
      semester2: 'DEMO · II semestris',
      demoBanner: 'DEMO · izdomāti dati · parole: Tests123?',
      login: 'Ienākt sistēmā',
      loginTitle: 'Ienākt sistēmā',
      loginHint:
        'Demonstrācijas versija ar izdomātiem datiem. Parole: Tests123?',
      password: 'Parole',
      loginSubmit: 'Ienākt',
      loginError: 'Nepareiza parole. Pamēģiniet vēlreiz!',
      enterPasswordAlert: 'Lai turpinātu, lūdzu, ievadiet paroli!',
      settings: 'Piekļūstamības iestatījumi',
      bgColor: 'Fona krāsa:',
      textColor: 'Teksta krāsa:',
      headerBg: 'Titullauka krāsa:',
      accentColor: 'Akcenta krāsa:',
      borderColor: 'Robežu krāsa:',
      cardBg: 'Kartīšu fona krāsa:',
      modalBg: 'Modāļa fona krāsa:',
      fontFamily: 'Fonts:',
      fontSize: 'Fonta izmērs:',
      fontSmall: 'Mazs (14px)',
      fontMedium: 'Vidējs (16px)',
      fontLarge: 'Liels (18px)',
      fontXLarge: 'Ļoti liels (20px)',
      save: 'Saglabāt',
      reset: 'Atiestatīt',
      photoCredit: 'Demonstrācijas versija',
      myClass: 'Mana klase',
      navToday: 'Šodien',
      navLessons: 'Stundu saraksts',
      navConsult: 'Konsultāciju saraksts',
      navClubs: 'Pulciņu saraksts',
      teacher: 'Skolotājs',
      room: 'Telpa',
      club: 'Pulciņš',
      teacherPlaceholder: 'Sākt rakstīt vārdu…',
      clubPlaceholder: 'Pulciņa nosaukums',
      searchPlaceholder: 'Meklēt pēc skolotāja, pulciņa, telpas.....',
      allClasses: 'Visas klases',
      clear: 'Notīrīt',
      logout: 'Iziet',
      noResults: 'Nav atrasts atbilstošs. Pamēģiniet citu meklēšanu!',
      versionBeta: 'Demonstrācijas versija',
      updatedAria: 'Pēdējoreiz atjaunots {date}',
      themeToggle: 'Pārslēgt tumšo / gaišo režīmu',
      settingsAria: 'Piekļūstamības iestatījumi',
      langAria: 'Valoda: latviešu. Pārslēgt uz angļu.',
      langButton: 'EN',
      typeLesson: 'Stunda',
      typeClub: 'Pulciņš',
      typeConsult: 'Konsultācija',
      week: 'nedēļa',
      todaySuffix: 'šodien',
      noLessonsFilter: 'Nav stundu šiem filtriem.',
      pickFilter:
        'Izvēlieties klasi, skolotāju, telpu vai pulciņu — šī ierīce to atcerēsies.',
      notSchoolDay: 'Šodien nav mācību diena',
      starts: 'Sākas',
      break: 'Pauze',
      next: 'nākamā',
      nextCap: 'Nākamā',
      dayOver: 'Mācību diena beigusies',
      now: 'Tagad',
      todayHeading: 'Šodien · {day}',
      mondayPreview: 'Pirmdienas priekšskatījums',
      offlineCache: 'Bez interneta · rādām pēdējo saglabāto sarakstu',
      lessonsToday: 'Stundas',
      clubsToday: 'Pulciņi šodien',
      consultToday: 'Konsultācijas šodien',
      noFilterMatch: 'Nav šiem filtriem',
      noTodayEntries: 'Šodien nav ierakstu šiem filtriem.',
      seeWholeWeek: 'Skatīt visu nedēļu',
      pickClass: 'Lūdzu, izvēlieties klasi, lai skatītu stundu sarakstu.',
      noClassData: 'Nav datu šai klasei.',
      print: 'Drukāt',
      share: 'Dalīties',
      copyLink: 'Kopēt saiti',
      pickClassFirst: 'Vispirms izvēlieties klasi.',
      linkCopied: 'Saite nokopēta.',
      colPeriod: 'St.p.k.',
      colTime: 'Laiks',
      colSubject: 'Priekšmets',
      colRoom: 'Telpa',
      colTeacher: 'Skolotājs',
      teacherLabel: 'Skolotājs',
      placeLabel: 'Nodarbību vieta',
      roomLabel: 'Telpa',
      hoursLabel: 'Stundas',
      classesLabel: 'Klases',
      classLabel: 'Klase',
      subjectLabel: 'Priekšmets',
      timeLabel: 'Laiks',
      roomSearch: 'Telpas meklēšana',
      classClubs: '{query} klase (pulciņi un laiki)',
      allClassesTimes: '(Visas klases un laiki)',
      notes: 'Pieraksti',
      notesAdd: '+ Jauns pieraksts',
      notesEmpty:
        'Nav pierakstu. Spiediet “+ Jauns pieraksts”, lai sāktu no sākuma.',
      notesPreview: 'Pieskarieties, lai apvērstu un rediģētu…',
      notesPlaceholder: 'Rakstiet šeit…\nVar vairākās rindās.',
      notesDelete: 'Dzēst šo pierakstu',
      notesDeleteConfirm: 'Vai tiešām dzēst šo pierakstu?',
      notesOpen: 'Atvērt pierakstus',
      notesClose: 'Aizvērt pierakstus',
      pwaUpdateTitle: '🔄 Jaunināšana pieejama!',
      pwaUpdateBody: 'Ir pieejama jauna versija ar atjauninājumiem.',
      pwaContentTitle: '📚 Jauns saturs pieejams!',
      pwaContentBody: 'Ir pieejami jauni mācību materiāli vai grafiki.',
      pwaUpdate: 'Atjaunināt',
      pwaLater: 'Vēlāk',
    },
    en: {
      schoolName: 'Tests School',
      semester2: 'DEMO · Semester II',
      demoBanner: 'DEMO · fictional data · password: Tests123?',
      login: 'Log in',
      loginTitle: 'Log in',
      loginHint: 'Demo with fictional data. Password: Tests123?',
      password: 'Password',
      loginSubmit: 'Log in',
      loginError: 'Wrong password. Please try again.',
      enterPasswordAlert: 'Please enter the password to continue.',
      settings: 'Accessibility settings',
      bgColor: 'Background colour:',
      textColor: 'Text colour:',
      headerBg: 'Header colour:',
      accentColor: 'Accent colour:',
      borderColor: 'Border colour:',
      cardBg: 'Card background:',
      modalBg: 'Dialog background:',
      fontFamily: 'Font:',
      fontSize: 'Font size:',
      fontSmall: 'Small (14px)',
      fontMedium: 'Medium (16px)',
      fontLarge: 'Large (18px)',
      fontXLarge: 'Extra large (20px)',
      save: 'Save',
      reset: 'Reset',
      photoCredit: 'Demo version',
      myClass: 'My class',
      navToday: 'Today',
      navLessons: 'Timetable',
      navConsult: 'Consultations',
      navClubs: 'Clubs',
      teacher: 'Teacher',
      room: 'Room',
      club: 'Club',
      teacherPlaceholder: 'Start typing a name…',
      clubPlaceholder: 'Club name',
      searchPlaceholder: 'Search by teacher, club, room…',
      allClasses: 'All classes',
      clear: 'Clear',
      logout: 'Log out',
      noResults: 'Nothing matched. Try a different search.',
      versionBeta: 'Demo version',
      updatedAria: 'Last updated {date}',
      themeToggle: 'Switch light / dark theme',
      settingsAria: 'Accessibility settings',
      langAria: 'Language: English. Switch to Latvian.',
      langButton: 'LV',
      typeLesson: 'Lesson',
      typeClub: 'Club',
      typeConsult: 'Consultation',
      week: 'week',
      todaySuffix: 'today',
      noLessonsFilter: 'No lessons for these filters.',
      pickFilter:
        'Choose a class, teacher, room or club — this device will remember it.',
      notSchoolDay: 'Today is not a school day',
      starts: 'Starts',
      break: 'Break',
      next: 'next',
      nextCap: 'Next',
      dayOver: 'The school day has ended',
      now: 'Now',
      todayHeading: 'Today · {day}',
      mondayPreview: 'Monday preview',
      offlineCache: 'Offline · showing the last saved timetable',
      lessonsToday: 'Lessons',
      clubsToday: 'Clubs today',
      consultToday: 'Consultations today',
      noFilterMatch: 'Nothing for these filters',
      noTodayEntries: 'Nothing in the timetable for these filters today.',
      seeWholeWeek: 'See the whole week',
      pickClass: 'Please choose a class to see the timetable.',
      noClassData: 'No data for this class.',
      print: 'Print',
      share: 'Share',
      copyLink: 'Copy link',
      pickClassFirst: 'Choose a class first.',
      linkCopied: 'Link copied.',
      colPeriod: 'No.',
      colTime: 'Time',
      colSubject: 'Subject',
      colRoom: 'Room',
      colTeacher: 'Teacher',
      teacherLabel: 'Teacher',
      placeLabel: 'Place',
      roomLabel: 'Room',
      hoursLabel: 'Hours',
      classesLabel: 'Classes',
      classLabel: 'Class',
      subjectLabel: 'Subject',
      timeLabel: 'Time',
      roomSearch: 'Room search',
      classClubs: '{query} class (clubs and times)',
      allClassesTimes: '(All classes and times)',
      notes: 'Notes',
      notesAdd: '+ New note',
      notesEmpty: 'No notes yet. Press “+ New note” to start again.',
      notesPreview: 'Tap to flip and edit…',
      notesPlaceholder: 'Write here…\nSeveral lines are fine.',
      notesDelete: 'Delete this note',
      notesDeleteConfirm: 'Delete this note?',
      notesOpen: 'Open notes',
      notesClose: 'Close notes',
      pwaUpdateTitle: '🔄 Update available!',
      pwaUpdateBody: 'A new version with updates is ready.',
      pwaContentTitle: '📚 New content available!',
      pwaContentBody: 'New learning materials or timetables are available.',
      pwaUpdate: 'Update',
      pwaLater: 'Later',
    },
  };

  const DAYS = {
    pirmdiena: 'Monday',
    otrdiena: 'Tuesday',
    trešdiena: 'Wednesday',
    tresdiena: 'Wednesday',
    ceturtdiena: 'Thursday',
    piektdiena: 'Friday',
  };

  const ATOMS = {
    'perioda stunda': 'Main lesson',
    'vizuālā māksla': 'Visual art',
    'vizualā māksla': 'Visual art',
    'viz. māksl': 'Visual art',
    'vizuālā māksl': 'Visual art',
    sports: 'PE',
    'sports un veselība': 'PE and health',
    mūzika: 'Music',
    eiritmija: 'Eurythmy',
    matemātika: 'Mathematics',
    'latviešu valoda': 'Latvian',
    'angļu valoda': 'English',
    'vācu valoda': 'German',
    'krievu valoda': 'Russian',
    'krievu valoda (f)': 'Russian (facultative)',
    'itāļu valoda': 'Italian',
    'lietuviešu valoda': 'Lithuanian',
    'dizains un tehnoloģijas': 'Design and technology',
    datorika: 'Computing',
    veidošana: 'Modelling',
    vijole: 'Violin',
    kokle: 'Cockle',
    lira: 'Lyre',
    solfedžo: 'Solfège',
    peldēšana: 'Swimming',
    pusdienas: 'Lunch',
    launags: 'Afternoon snack',
    'klases stunda': 'Class lesson',
    dabaszinības: 'Nature studies',
    bioloģija: 'Biology',
    fizika: 'Physics',
    ķīmija: 'Chemistry',
    ģeogrāfija: 'Geography',
    vēsture: 'History',
    'latvijas un pasaules vēsture': 'Latvian and world history',
    'sociālās zinības': 'Social studies',
    'sociālās zinības un vēsture': 'Social studies and history',
    literatūra: 'Literature',
    teātris: 'Drama',
    inženierzinības: 'Engineering',
    'projekta darbs': 'Project work',
    'projektu darbs': 'Project work',
  };

  const PHRASES = {
    '1. klašu koris': 'Grade 1 choir',
    '2. –4. klašu koris': 'Grades 2–4 choir',
    '2. –4. klašu vokālais ansamblis': 'Grades 2–4 vocal ensemble',
    '4. –7. klašu zēnu koris': 'Grades 4–7 boys’ choir',
    '5. –7. klašu zēnu koris': 'Grades 5–7 boys’ choir',
    '5. –9. klašu koris „rīta spārni”': 'Grades 5–9 choir “Rīta spārni”',
    '5. –9. klašu zēnu vokālais ansamblis': 'Grades 5–9 boys’ vocal ensemble',
    'bibliotēka: lasītājiem': 'Library: for readers',
    'dabaszinību pulciņš': 'Nature studies club',
    eiritmija: 'Eurythmy',
    'galda teniss 2.-6. klasei': 'Table tennis, grades 2–6',
    'galda teniss 6.-9.kl.': 'Table tennis, grades 6–9',
    'kokapstrādes pulciņš': 'Woodwork club',
    'kokles spēle': 'Kokle',
    'koriģējošā vingrošana': 'Corrective gymnastics',
    'lietišķā māksla': 'Applied arts',
    'liras spēle': 'Lyre',
    'mazais dancis': 'Little folk dance',
    orķestris: 'Orchestra',
    'orķestris 5.-6. klasei': 'Orchestra, grades 5–6',
    'spēļu vingrošana': 'Play gymnastics',
    'stīgu orķestris (vijoles spēle)': 'String orchestra (violin)',
    tekstildarbi: 'Textile crafts',
    teātris: 'Drama',
    veidošana: 'Modelling',
    'vispusīga fiziskā sagatavotība "mazie sportisti"':
      'General fitness “Little athletes”',
    'vizuālās mākslas studija': 'Visual art studio',
    'vizuālās mākslas studija (gleznošana)': 'Visual art studio (painting)',
    'vokālais ansamblis „mellenes” 2. klase':
      'Vocal ensemble “Mellenes”, grade 2',
    'vokālais ansamblis „mellenes” 3. klase':
      'Vocal ensemble “Mellenes”, grade 3',
    'vokālais ansamblis „mellenes” 4. -6. klase':
      'Vocal ensemble “Mellenes”, grades 4–6',
    'ģitāras studija': 'Guitar studio',
  };

  function getLanguage() {
    const saved = localStorage.getItem(PREF_LANG);
    return saved === 'en' ? 'en' : 'lv';
  }

  function t(key, vars) {
    const lang = getLanguage();
    let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.lv[key] || key;
    if (vars) {
      Object.keys(vars).forEach((name) => {
        text = text.split(`{${name}}`).join(String(vars[name]));
      });
    }
    return text;
  }

  function normalizeKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\*/g, '')
      .replace(/vizualā/g, 'vizuālā')
      .replace(/ītāļu/g, 'itāļu')
      .replace(/matematika/g, 'matemātika')
      .replace(/projektu darbs/g, 'projekta darbs')
      .replace(/dizains un teh\.?/g, 'dizains un tehnoloģijas')
      .replace(/dizains un tehn\.?/g, 'dizains un tehnoloģijas')
      .replace(/angļu val\.?/g, 'angļu valoda')
      .replace(/vācu val\.?/g, 'vācu valoda')
      .replace(/krievu val\.?/g, 'krievu valoda')
      .replace(/latviešu val\.?/g, 'latviešu valoda')
      .replace(/itāļu val\.?/g, 'itāļu valoda')
      .replace(/lietuviešu val\.?/g, 'lietuviešu valoda')
      .replace(/sociālās zin\./g, 'sociālās zinības')
      .replace(/\s+/g, ' ')
      .replace(/\.$/, '')
      .trim();
  }

  function lookupAtom(part) {
    const key = normalizeKey(part);
    if (!key) return part;
    if (ATOMS[key]) return ATOMS[key];
    if (PHRASES[key]) return PHRASES[key];
    return null;
  }

  function decorate(original, translated) {
    const stars = (original.match(/\*/g) || []).length;
    if (!stars) return translated;
    if (original.trim().startsWith('*') && original.trim().endsWith('*')) {
      return `*${translated}*`;
    }
    if (original.includes('*')) return `${translated}*`;
    return translated;
  }

  function translatePhrase(raw) {
    if (!raw || getLanguage() === 'lv') return raw;
    const source = String(raw);
    const whole = lookupAtom(source) || PHRASES[normalizeKey(source)];
    if (whole && !source.includes('/')) return decorate(source, whole);

    if (source.includes('/')) {
      return source
        .split(/\s*\/\s*/)
        .map((part) => {
          const found = lookupAtom(part);
          return found ? decorate(part, found) : part.trim();
        })
        .join(' / ');
    }

    const found = lookupAtom(source);
    return found ? decorate(source, found) : source;
  }

  function translateDay(day) {
    if (!day || getLanguage() === 'lv') return day;
    const key = String(day).toLowerCase().replace(/š/g, 's');
    return DAYS[String(day).toLowerCase()] || DAYS[key] || day;
  }

  function applyI18n(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute(
        'placeholder',
        t(el.getAttribute('data-i18n-placeholder'))
      );
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const date = el.getAttribute('data-updated');
      el.setAttribute('aria-label', date ? t(key, { date }) : t(key));
    });
    document.documentElement.lang = getLanguage();
    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.textContent = t('langButton');
      btn.setAttribute('aria-label', t('langAria'));
    });
  }

  function setLanguage(lang) {
    const next = lang === 'en' ? 'en' : 'lv';
    localStorage.setItem(PREF_LANG, next);
    applyI18n();
    listeners.forEach((fn) => {
      try {
        fn(next);
      } catch (error) {
        console.warn(error);
      }
    });
  }

  function toggleLanguage() {
    setLanguage(getLanguage() === 'en' ? 'lv' : 'en');
  }

  function onLanguageChange(fn) {
    listeners.push(fn);
  }

  let langToggleBound = false;
  function bindLanguageToggle() {
    if (langToggleBound) return;
    langToggleBound = true;
    document.addEventListener('click', (e) => {
      if (e.target.closest('.lang-toggle')) {
        toggleLanguage();
      }
    });
  }

  global.RVS_I18N = {
    t,
    translatePhrase,
    translateDay,
    getLanguage,
    setLanguage,
    toggleLanguage,
    applyI18n,
    onLanguageChange,
    bindLanguageToggle,
  };

  function start() {
    applyI18n();
    bindLanguageToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
