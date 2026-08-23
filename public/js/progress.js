// Global progress tracking system for math learning
class ProgressTracker {
  constructor(subject) {
    this.subject = subject;
    this.errorsThisSession = 0;
  }

  // Load and display stats at the top of the page
  loadStats() {
    const completed = localStorage.getItem(`completed_${this.subject}`) || 0;
    const totalErrors = localStorage.getItem(`errors_${this.subject}`) || 0;
    const best = localStorage.getItem(`best_${this.subject}`) || 'nav vēl';
    const avgErrors = completed > 0 ? (totalErrors / completed).toFixed(1) : 0;

    // Create stats display
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats';
    statsDiv.innerHTML = `
      <h3>Tavs progress 🚀</h3>
      <p>Pabeigts: <strong>${completed}</strong> reizes</p>
      <p>Vidēji kļūdas: <strong>${avgErrors}</strong></p>
      <p>Labākais: <strong>${best === 'nav vēl' ? 'nav vēl' : best + ' kļūdas'}</strong></p>
      <button onclick="progressTracker.resetStats()">Dzēst statistiku</button>
    `;
    document.body.insertBefore(statsDiv, document.body.firstChild);
  }

  // Reset all stats for this subject
  resetStats() {
    if (confirm('Tiešām dzēst visu progresu šim priekšmetam?')) {
      localStorage.removeItem(`completed_${this.subject}`);
      localStorage.removeItem(`errors_${this.subject}`);
      localStorage.removeItem(`best_${this.subject}`);
      location.reload();
    }
  }

  // Count an error in the current session
  countError() {
    this.errorsThisSession++;
  }

  // Save completion stats and return session results
  saveCompletionStats() {
    const completed =
      parseInt(localStorage.getItem(`completed_${this.subject}`) || '0') + 1;
    localStorage.setItem(`completed_${this.subject}`, completed);

    const totalErrors =
      parseInt(localStorage.getItem(`errors_${this.subject}`) || '0') +
      this.errorsThisSession;
    localStorage.setItem(`errors_${this.subject}`, totalErrors);

    let best = localStorage.getItem(`best_${this.subject}`);
    if (best === 'nav vēl' || this.errorsThisSession < parseInt(best)) {
      localStorage.setItem(`best_${this.subject}`, this.errorsThisSession);
    }

    return {
      sessionErrors: this.errorsThisSession,
      bestScore: localStorage.getItem(`best_${this.subject}`),
    };
  }
}

// Static method for overall progress dashboard
ProgressTracker.getOverallStats = function (subjects) {
  let html =
    '<h2>Kopējais progress</h2><table><tr><th>Priekšmets</th><th>Pabeigts</th><th>Vid. kļūdas</th><th>Labākais</th></tr>';
  subjects.forEach((s) => {
    const completed = localStorage.getItem(`completed_${s}`) || 0;
    const errors = localStorage.getItem(`errors_${s}`) || 0;
    const best = localStorage.getItem(`best_${s}`) || 'nav';
    const avg = completed > 0 ? (errors / completed).toFixed(1) : '-';
    html += `<tr><td>${s}</td><td>${completed}</td><td>${avg}</td><td>${best}</td></tr>`;
  });
  html += '</table>';
  return html;
};

// Make it globally available
window.ProgressTracker = ProgressTracker;
