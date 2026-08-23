(function () {
  const token = localStorage.getItem('jwt_token');
  if (token) return;

  const KEY =
    '77e4a8d87894e5d373c5cdc9a859ca93f4eb07069168e78091ff0908f3059a94';
  const N = 7;

  let typed = '';
  let audio = null;
  let armed = false;

  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/ā/g, 'a')
      .replace(/č/g, 'c')
      .replace(/ē/g, 'e')
      .replace(/ģ/g, 'g')
      .replace(/ī/g, 'i')
      .replace(/ķ/g, 'k')
      .replace(/ļ/g, 'l')
      .replace(/ņ/g, 'n')
      .replace(/š/g, 's')
      .replace(/ū/g, 'u')
      .replace(/ž/g, 'z');
  }

  async function digest(str) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(str)
    );
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  document.addEventListener('keydown', async (e) => {
    if (!/[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/.test(e.key)) return;

    typed += e.key;
    if (typed.length > 30) typed = typed.slice(-15);

    const chunk = normalize(typed).slice(-N);
    if (chunk.length < N) return;
    if ((await digest(chunk)) !== KEY) return;

    typed = '';
    arm();
  });

  function arm() {
    if (armed) return;
    armed = true;

    const trigger = document.createElement('button');
    trigger.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;background:transparent;border:none;cursor:pointer;z-index:10000;opacity:0;';

    if (!audio) {
      audio = new Audio('/audio/x.mp3');
      audio.volume = 0.7;
    }

    const play = () => {
      trigger.remove();
      armed = false;
      audio.currentTime = 0;
      audio.play().catch(() => {});

      const overlay = document.createElement('div');
      overlay.style.cssText =
        'position:fixed;inset:0;background:#000;z-index:9999;display:flex;align-items:center;justify-content:center;color:#ff3366;font-family:Impact,sans-serif;text-align:center;pointer-events:none;animation:fade 9s forwards;';
      overlay.innerHTML = new TextDecoder().decode(
        Uint8Array.from(atob('PGRpdj48aDEgc3R5bGU9ImZvbnQtc2l6ZTo4dnc7bWFyZ2luOjA7YW5pbWF0aW9uOnNoYWtlIDAuNXMgaW5maW5pdGU7Ij5XRSBET04nVCBORUVEIE5PPGJyPkVEVUNBVElPTjwvaDE+PHAgc3R5bGU9ImZvbnQtc2l6ZTozdnc7bWFyZ2luLXRvcDoydmg7Ij5IZXkgdGVhY2hlcuKApiBsZWF2ZSB0aG9zZSBraWRzIGFsb25lITwvcD48cCBzdHlsZT0iZm9udC1zaXplOjJ2dztjb2xvcjojZmY2Njk5O21hcmdpbi10b3A6M3ZoOyI+QnLEq3bEq2JhIFZhbGRvcmbEgSE8L3A+PC9kaXY+'), (c) =>
          c.charCodeAt(0)
        )
      );
      document.body.appendChild(overlay);

      const style = document.createElement('style');
      style.textContent =
        '@keyframes fade{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}@keyframes shake{0%,100%{transform:translate(0)}10%,30%,50%,70%,90%{transform:translate(-8px,0)}20%,40%,60%,80%{transform:translate(8px,0)}}';
      document.head.appendChild(style);

      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 200000);
    };

    trigger.addEventListener('click', play);
    document.body.appendChild(trigger);
    setTimeout(() => {
      if (trigger.parentNode) trigger.remove();
      armed = false;
    }, 30000);
  }
})();
