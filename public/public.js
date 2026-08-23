// python -m http.server 3000 to start localhost:3000, Ctrl+C to stop Public navigation script - separate from authenticated schedule logic

/* global document, localStorage, confirm, openSettings, toggleDarkMode, setTimeout, console, MutationObserver, closeLogin, closeSettings, window */

let publicCurrentGrade = '';
let publicCurrentSubject = '';

const niceNames = {
  matematika2: 'Matemātika',
  latv_val2: 'Latviešu valoda',
  matematika3: 'Matemātika',
  latv_val3: 'Latviešu valoda',
  // Add more as needed
};

// Public task pickers hidden until the lessons are ready.
const publicAllClasses = [
  // '2. klase;grade-2',
  // '3. klase;grade-3',
  // '4. klase;grade-4',
  // '5. klase;grade-5',
];

const publicContentMap = {
  // 'grade-2': {
  //   matematika2: [
  //     { id: 'time', title: 'Laiks (pulksteņi)', url: 'grade-2/matematika2/time/grade-2-math-time.html' },
  //     { id: 'warmup2', title: 'Iesildīšanās', url: 'grade-2/matematika2/warmup2/grade-2-math-warmup.html' },
  //     { id: 'plus-minus', title: 'Saskaitīšana un atņemšana', url: 'grade-2/matematika2/+-/grade-2-math-plus-minus.html' },
  //     { id: 'multiplication', title: 'Reizināšana', url: 'grade-2/matematika2/multiplication2/grade-2-math-multiplication.html' },
  //   ],
  //   latv_val2: [
  //     { id: 'zilbes', title: 'Zilbes', url: 'grade-2/latv.val2/zilbes/grade-2-zilbes.html' },
  //     { id: 'latviesu-lielie-burti', title: 'Lielie burti un īpašvārdi', url: 'grade-2/latv.val2/lielie_burti/grade-2-lielie-burti.html' },
  //     { id: 'latviesu-teikumi', title: 'Sakārto vārdus teikumā', url: 'grade-2/latv.val2/teikumi/grade-2-teikumi.html' },
  //     { id: 'darbibas-vardi', title: 'Darbības vārdi', url: 'grade-2/latv.val2/darbibas_vardi/grade-2-darbibas-vardi.html' },
  //   ],
  // },
  // 'grade-3': {
  //   matematika3: [
  //     { id: 'Rom Time', title: 'Laiks (pulksteņi)', url: 'grade-3/matematika3/Rom_Time3/grade-3-math-time.html' },
  //   ],
  // },
};

function getCurrentIndex(grade, subject) {
  const key = `progress_${grade}_${subject}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

function setCurrentIndex(grade, subject, index) {
  const key = `progress_${grade}_${subject}`;
  localStorage.setItem(key, index.toString());
}

function clearProgress(grade, subject) {
  const key = `progress_${grade}_${subject}`;
  localStorage.removeItem(key);
}

function handlePublicGradeChange(e) {
  publicCurrentGrade = e.target.value;
  const subjectSelect = document.getElementById('public-subject-select');
  subjectSelect.innerHTML = '<option value="">Izvēlieties priekšmetu</option>';

  // Populate subjects from the content map
  if (publicCurrentGrade && publicContentMap[publicCurrentGrade]) {
    const gradeSubjects = publicContentMap[publicCurrentGrade];
    Object.keys(gradeSubjects).forEach((subjectKey) => {
      const displayName =
        niceNames[subjectKey] ||
        subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1); // Fallback to capitalized
      subjectSelect.innerHTML += `<option value="${subjectKey}">${displayName}</option>`;
    });
  }

  publicCurrentSubject = '';
  document.getElementById('public-content').innerHTML = '';
}

function handlePublicSubjectChange(e) {
  publicCurrentSubject = e.target.value;
  generateTaskRadios();
  // Don't call updatePublicContent() here - let radio button selection trigger it
}

function generateTaskRadios() {
  const radioContainer = document.getElementById('public-task-radios');

  if (!publicCurrentGrade || !publicCurrentSubject) {
    radioContainer.style.display = 'none';
    radioContainer.innerHTML = '';
    return;
  }

  const lessons = publicContentMap[publicCurrentGrade]?.[publicCurrentSubject];
  if (!lessons || lessons.length === 0) {
    radioContainer.style.display = 'none';
    radioContainer.innerHTML = '';
    return;
  }

  // Generate radio buttons for each task
  let html = '<legend>Uzdevumi:</legend>';
  lessons.forEach((lesson, index) => {
    const radioId = `task-radio-${index}`;
    html += `
      <label for="${radioId}">
        <input
          type="radio"
          name="public-task"
          value="${index}"
          id="${radioId}"
        />
        ${lesson.title}
      </label>
    `;
  });

  radioContainer.innerHTML = html;
  radioContainer.style.display = 'block';

  // Add event listeners for radio buttons
  lessons.forEach((lesson, index) => {
    const radioId = `task-radio-${index}`;
    document.getElementById(radioId)?.addEventListener('change', (e) => {
      if (e.target.checked) {
        setCurrentIndex(publicCurrentGrade, publicCurrentSubject, index);
        updatePublicContent();
      }
    });
  });
}

function updatePublicContent() {
  const contentDiv = document.getElementById('public-content');
  contentDiv.innerHTML = '';

  if (!publicCurrentGrade || !publicCurrentSubject) return;

  const lessons = publicContentMap[publicCurrentGrade]?.[publicCurrentSubject];
  if (!lessons || lessons.length === 0) {
    contentDiv.innerHTML = '<p class="info">Saturs vēl top!</p>';
    return;
  }

  let currentIndex = getCurrentIndex(publicCurrentGrade, publicCurrentSubject);
  if (currentIndex >= lessons.length) currentIndex = lessons.length - 1; // drošībai

  // Sync radio button selection with stored progress
  const radioId = `task-radio-${currentIndex}`;
  const radioButton = document.getElementById(radioId);
  if (radioButton) {
    radioButton.checked = true;
  }

  const lesson = lessons[currentIndex];

  // Progress indikators
  const progress = `${currentIndex + 1} / ${lessons.length}`;

  // Add cache-busting parameter to prevent stale content
  const cacheBustParam = `?v=${Date.now()}`;
  const lessonUrl = lesson.url + cacheBustParam;

  // Enter immersive mode automatically
  document.body.classList.add('task-mode');

  let html = `
    <div class="immersive-lesson">
      <iframe src="${lessonUrl}" class="lesson-iframe"></iframe>
      <div class="immersive-bottom-nav">
        <button id="prev-btn" ${currentIndex === 0 ? 'disabled' : ''}>⬅ Iepriekšējais</button>
        <button id="exit-btn">🏠 Iziet</button>
        <button id="next-btn" ${currentIndex === lessons.length - 1 ? 'disabled' : ''}>Nākamais ➡</button>
      </div>
    </div>
  `;

  contentDiv.innerHTML = html;

  const lessonFrame = contentDiv.querySelector('.lesson-iframe');
  if (lessonFrame) {
    lessonFrame.addEventListener('load', () => {
      try {
        const doc = lessonFrame.contentDocument;
        if (doc?.body) {
          doc.documentElement.style.overflowY = 'auto';
          doc.body.style.overflowY = 'auto';
          doc.body.style.paddingBottom = '2.5rem';
        }
      } catch (error) {
        console.warn(error);
      }
      if (typeof applySettingsToLessonFrames === 'function') {
        applySettingsToLessonFrames();
      }
    });
  }

  // Event listeners pogām
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        publicCurrentGrade,
        publicCurrentSubject,
        currentIndex - 1
      );
      updatePublicContent();
    }
  });

  document.getElementById('next-btn')?.addEventListener('click', () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(
        publicCurrentGrade,
        publicCurrentSubject,
        currentIndex + 1
      );
      updatePublicContent();
    }
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (confirm('Tiešām sākt priekšmetu no jauna?')) {
      clearProgress(publicCurrentGrade, publicCurrentSubject);
      updatePublicContent();
    }
  });

  // Exit immersive mode
  document.getElementById('exit-btn')?.addEventListener('click', exitTaskMode);
}

function exitTaskMode() {
  document.body.classList.remove('task-mode');
  // Clear the immersive lesson content
  document.getElementById('public-content').innerHTML = '';
  // Radio buttons will automatically become visible again
}

function clearPublicSelections() {
  publicCurrentGrade = '';
  publicCurrentSubject = '';
  document.getElementById('public-grade-select').value = '';
  document.getElementById('public-subject-select').innerHTML =
    '<option value="">Izvēlieties priekšmetu</option>';
  document.getElementById('public-task-radios').style.display = 'none';
  document.getElementById('public-task-radios').innerHTML = '';
  document.getElementById('public-content').innerHTML = '';
}

function populatePublicGrades() {
  const gradeSelect = document.getElementById('public-grade-select');
  if (gradeSelect) {
    gradeSelect.innerHTML = '<option value="">Izvēlieties klasi</option>';
    publicAllClasses.forEach((cls) => {
      const [display, value] = cls.split(';');
      gradeSelect.innerHTML += `<option value="${value}">${display}</option>`;
    });
  }
}

function openLogin() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.style.display = 'block';
}

// Initialize public navigation when DOM is ready
function initializePublicNavigation() {
  if (!document.getElementById('public-grade-select')) {
    return;
  }
  populatePublicGrades();

  const publicGradeSelect = document.getElementById('public-grade-select');
  if (publicGradeSelect) {
    publicGradeSelect.addEventListener('change', handlePublicGradeChange);
  }

  const publicSubjectSelect = document.getElementById('public-subject-select');
  if (publicSubjectSelect)
    publicSubjectSelect.addEventListener('change', handlePublicSubjectChange);

  const publicSettingsToggle = document.getElementById(
    'public-settings-toggle'
  );
  if (publicSettingsToggle)
    publicSettingsToggle.addEventListener('click', openSettings);
}

// Keyboard navigation support
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

  // Handle lesson navigation with arrow keys
  if (event.target.closest('#public-content')) {
    const currentLesson = document.querySelector('.lesson-container');
    if (currentLesson) {
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');

      if (event.key === 'ArrowLeft' && prevBtn && !prevBtn.disabled) {
        event.preventDefault();
        prevBtn.click();
      } else if (event.key === 'ArrowRight' && nextBtn && !nextBtn.disabled) {
        event.preventDefault();
        nextBtn.click();
      }
    }
  }
}

// Add message event listener for iframe communication
window.addEventListener('message', (event) => {
  // Only accept messages from our own origin for security
  if (event.origin !== window.location.origin) return;

  if (event.data === 'next-lesson') {
    // Trigger next lesson navigation
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.click();
    }
  }
});

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

// Try multiple initialization methods for Next.js compatibility
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializePublicNavigation();
    improveModalAccessibility();
  });
} else {
  // DOM already loaded, but elements might not be rendered yet
  setTimeout(() => {
    initializePublicNavigation();
    improveModalAccessibility();
  }, 100);
}

// Also try after a short delay in case React hasn't rendered yet
setTimeout(() => {
  if (
    !document
      .querySelector('#public-grade-select')
      ?.hasAttribute('data-initialized')
  ) {
    waitForElement('#public-grade-select', () => {
      initializePublicNavigation();
      improveModalAccessibility();
      document
        .querySelector('#public-grade-select')
        ?.setAttribute('data-initialized', 'true');
    });
  }
}, 500);
