import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Tests skola (demo)',
  description: 'Demonstrācijas versija ar izdomātiem datiem — skolas grafiki',
  icons: {
    icon: '/favicon.png',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#1e3d28',
    'msapplication-TileColor': '#1e3d28',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lv">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="public-view">
        {children}
        <Analytics />
        <Script src="/js/i18n.js" strategy="afterInteractive" />
        <Script src="/js/demo-guide.js" strategy="afterInteractive" />
        <Script src="/public.js" strategy="afterInteractive" />
        <Script src="/script.js" strategy="afterInteractive" />
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('PWA service worker reģistrēts!');

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, show update notification
                            showUpdateNotification();
                          }
                        });
                      }
                    });

                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                      if (window.__rvsApplyingUpdate) {
                        window.location.reload();
                      }
                    });

                    // Check for content updates periodically
                    checkForContentUpdates();
                    setInterval(checkForContentUpdates, 300000); // Check every 5 minutes
                  })
                  .catch((error) => console.log('Service worker reģistrēšanās kļūda:', error));
              } else if ('serviceWorker' in navigator) {
                console.log('Service worker nav reģistrēts - nepieciešams HTTPS vai localhost vide.');
              }

              (function setupNightlyRefresh() {
                function msUntilNext4am() {
                  const now = new Date();
                  const next = new Date(now);
                  next.setHours(4, 0, 0, 0);
                  if (next <= now) next.setDate(next.getDate() + 1);
                  return next.getTime() - now.getTime();
                }
                function notesBusy() {
                  const notes = document.getElementById('flipbook-notes');
                  return !!(
                    notes &&
                    notes.style.display === 'block' &&
                    document.activeElement &&
                    document.activeElement.closest &&
                    document.activeElement.closest('#flipbook-notes')
                  );
                }
                async function refreshQuietly() {
                  if (document.visibilityState !== 'visible') return;
                  if (notesBusy()) {
                    setTimeout(refreshQuietly, 5 * 60 * 1000);
                    return;
                  }
                  window.__rvsApplyingUpdate = true;
                  try {
                    if ('serviceWorker' in navigator) {
                      const reg = await navigator.serviceWorker.getRegistration();
                      if (reg) {
                        await reg.update();
                        if (reg.waiting) {
                          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                          return;
                        }
                      }
                    }
                  } catch (error) {}
                  window.location.reload();
                }
                function armRefresh() {
                  if (document.visibilityState === 'visible') {
                    refreshQuietly();
                    return;
                  }
                  document.addEventListener('visibilitychange', function whenVisible() {
                    if (document.visibilityState === 'visible') {
                      document.removeEventListener('visibilitychange', whenVisible);
                      refreshQuietly();
                    }
                  });
                }
                setTimeout(armRefresh, msUntilNext4am());
              })();

              // Function to show update notification
              function showUpdateNotification(type = 'app') {
                if (document.getElementById('pwa-update-notification')) return;
                const i18n = window.RVS_I18N;
                const tx = (key, fallback) => (i18n && i18n.t(key)) || fallback;
                const messages = {
                  app: {
                    title: tx('pwaUpdateTitle', '🔄 Jaunināšana pieejama!'),
                    description: tx('pwaUpdateBody', 'Ir pieejama jauna versija ar atjauninājumiem.')
                  },
                  content: {
                    title: tx('pwaContentTitle', '📚 Jauns saturs pieejams!'),
                    description: tx('pwaContentBody', 'Ir pieejami jauni mācību materiāli vai grafiki.')
                  }
                };

                const msg = messages[type] || messages.app;
                const updateLabel = tx('pwaUpdate', 'Atjaunināt');
                const laterLabel = tx('pwaLater', 'Vēlāk');

                const notification = document.createElement('div');
                notification.id = 'pwa-update-notification';
                notification.innerHTML = \`
                  <div style="
                    position: fixed;
                    left: 16px;
                    right: 16px;
                    bottom: 20px;
                    margin: 0 auto;
                    max-width: 360px;
                    background: #1e3d28;
                    color: white;
                    padding: 16px 18px;
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                  ">
                    <div style="font-weight: bold; margin-bottom: 8px;">\${msg.title}</div>
                    <div style="font-size: 14px; margin-bottom: 14px;">\${msg.description}</div>
                    <div style="display: flex; gap: 10px;">
                      <button onclick="applyUpdate()" style="
                        flex: 1;
                        background: white;
                        color: #1e3d28;
                        border: none;
                        padding: 12px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                      ">\${updateLabel}</button>
                      <button onclick="dismissUpdate()" style="
                        flex: 1;
                        background: transparent;
                        color: white;
                        border: 1px solid white;
                        padding: 12px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                      ">\${laterLabel}</button>
                    </div>
                  </div>
                \`;
                document.body.appendChild(notification);
              }

              // Function to check for content updates
              async function checkForContentUpdates() {
                try {
                  // Only check for updates if user is authenticated
                  const token = localStorage.getItem('jwt_token');
                  if (!token) {
                    return; // Skip update check if not authenticated
                  }

                  // Check schedules API with authentication
                  const scheduleResponse = await fetch('/api/schedules', {
                    headers: {
                      'Authorization': \`Bearer \${token}\`,
                      'Content-Type': 'application/json'
                    }
                  });
                  const lessonResponse = await fetch('/api/lesson-times', {
                    headers: {
                      'Authorization': \`Bearer \${token}\`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (scheduleResponse.ok && lessonResponse.ok) {
                    const schedules = await scheduleResponse.json();
                    const lessons = await lessonResponse.json();

                    // Check if content has changed (simple version - check length)
                    const storedScheduleCount = localStorage.getItem('scheduleCount');
                    const storedLessonCount = localStorage.getItem('lessonCount');

                    const currentScheduleCount = JSON.stringify(schedules).length;
                    const currentLessonCount = JSON.stringify(lessons).length;

                    if (storedScheduleCount && storedLessonCount) {
                      if (currentScheduleCount !== parseInt(storedScheduleCount) ||
                          currentLessonCount !== parseInt(storedLessonCount)) {
                        showUpdateNotification('content');
                      }
                    }

                    // Update stored counts
                    localStorage.setItem('scheduleCount', currentScheduleCount.toString());
                    localStorage.setItem('lessonCount', currentLessonCount.toString());
                  }
                } catch (error) {
                  console.log('Content update check failed:', error);
                }
              }

              // Function to apply update
              window.applyUpdate = function() {
                window.__rvsApplyingUpdate = true;
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistration().then((reg) => {
                    if (reg && reg.waiting) {
                      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    } else {
                      window.location.reload();
                    }
                  });
                } else {
                  window.location.reload();
                }
                document.getElementById('pwa-update-notification')?.remove();
              };

              // Function to dismiss update notification
              window.dismissUpdate = function() {
                document.getElementById('pwa-update-notification')?.remove();
              };
            `,
          }}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
