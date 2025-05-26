(() => {
  /* ---------------------------------------------------------
     DOM cache
  --------------------------------------------------------- */
  const steps        = [...document.querySelectorAll(".step")];
  let   current      = -1;                      //  start BEFORE first step

  // Music controls
  const musicBtn     = document.getElementById("music-btn");
  const music        = document.getElementById("bg-music");

  // Truth-or-Dare, Riddle elements
  const truthBtn     = document.getElementById("truth-btn");
  const dareBtn      = document.getElementById("dare-btn");
  const todResult    = document.getElementById("tod-result");
  const todNext      = document.getElementById("tod-next");
  const riddleInput  = document.getElementById("riddle-input");
  const riddleBtn    = document.getElementById("riddle-btn");
  const riddleFeedback = document.getElementById("riddle-feedback");

  /* ---------------------------------------------------------
     Inventory configuration
  --------------------------------------------------------- */
  const itemMap = {
    0: "item-1",   // Step-1 🕯️
    1: "item-2",   // Step-2 🌻
    2: "item-3",   // Step-3 💌
    3: "item-4",   // Step-4 🔑
    4: "item-5"    // Step-5 🎁
  };

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */
  function addSparkleToItem(item) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.textContent = "✨";
    item.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }

  function runTypewriterInCurrentStep() {
    const typewriters = steps[current].querySelectorAll(".typewriter");
    typewriters.forEach(el => typewriterEffect(el));
  }

  function typewriterEffect(el) {
    const text  = el.getAttribute("data-text");
    el.textContent = "";
    let i = 0;
    (function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        setTimeout(type, 50);
      }
    })();
  }

  /* ---------------------------------------------------------
     Core navigation
  --------------------------------------------------------- */
  function showStep(index) {
    if (current >= 0) steps[current].classList.remove("active"); // hide old
    current = index;
    steps[current].classList.add("active");                      // show new
    window.scrollTo({ top: 0, behavior: "smooth" });

    /* Inventory reveal */
    const slotId = itemMap[current];
    if (slotId) {
      const slot = document.getElementById(slotId);
      if (slot && !slot.classList.contains("collected")) {
        slot.classList.add("collected");
        addSparkleToItem(slot);
      }
    }

    /* Typewriter (optional blocks inside step) */
    runTypewriterInCurrentStep();

    /* Fireworks: start on Step 5, stop otherwise */
    if (current === 4) {
      startFireworks();
    } else {
      stopFireworks();
    }
  }

  /* ---------------------------------------------------------
     Start-screen handler
  --------------------------------------------------------- */
  document.getElementById("start-button").addEventListener("click", () => {
    const overlay = document.getElementById("start-screen");

    // central flash
    const sp = document.createElement("div");
    sp.className = "start-sparkle";
    sp.textContent = "✨";
    document.body.appendChild(sp);

    // fade overlay, then remove + show first step
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.remove();
      showStep(0);                    // reveal Step-1
    }, 600);                          // timing matches CSS fade
  });

  /* ---------------------------------------------------------
     Step internal interactions
  --------------------------------------------------------- */
  /* next buttons */
  document.querySelectorAll("[data-next]")
          .forEach(btn => btn.addEventListener("click",
            () => showStep(current + 1)));

  /* music toggle */
  musicBtn.addEventListener("click", () => {
    if (music.paused) {
      music.play();
      musicBtn.textContent = "⏸ Music";
    } else {
      music.pause();
      musicBtn.textContent = "▶ Music";
    }
  });

  /* Truth-or-Dare */
  truthBtn.addEventListener("click", () => {
    todResult.textContent =
      "Truth:What's one thing 🤔 you've always wanted to tell me 🗣️ but never did? 🤷‍♀️";
    revealTOD();
  });
  dareBtn.addEventListener("click", () => {
    todResult.textContent = "Dare: Send me a selfie blowing a kiss right now! 💋";
    revealTOD();
  });
  function revealTOD() {
    todResult.classList.remove("hidden");
    todNext.classList.remove("hidden");
    truthBtn.disabled = dareBtn.disabled = true;
  }

  /* Riddle */
  riddleBtn.addEventListener("click", () => {
    const answer = riddleInput.value.trim().toLowerCase();
    if (answer === "terrace") {
      riddleFeedback.textContent = "Correct!";
      riddleFeedback.style.color = "green";
      setTimeout(() => showStep(current + 1), 1000);
    } else {
      riddleFeedback.textContent = "Nope, try again ♥";
      riddleFeedback.style.color = "red";
    }
  });

  /* ---------------------------------------------------------
     Background sparkles (tiny floating ones)
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement("div");
    container.className = "sparkle-container";
    document.body.appendChild(container);

    for (let i = 0; i < 30; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      const size = 3 + Math.random() * 3;
      Object.assign(s.style, {
        width:  `${size}px`,
        height: `${size}px`,
        top:  `${Math.random() * 100}vh`,
        left: `${Math.random() * 100}vw`,
        animationDelay: `${Math.random() * 3}s`
      });
      container.appendChild(s);
    }
  });

  /* ---------------------------------------------------------
     Canvas sparkle layer (pixie dust)
  --------------------------------------------------------- */
  const canvas  = document.getElementById("sparkle-canvas");
  const ctx     = canvas.getContext("2d");
  let   dust    = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function makeDust() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      a: Math.random(),
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      da: Math.random() * 0.02 + 0.005
    };
  }
  dust = Array.from({ length: 100 }, makeDust);

  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dust.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy; p.a -= p.da;
      if (p.a <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        dust[i] = makeDust();
      }
    });
    requestAnimationFrame(draw);
  })();

  /* ---------------------------------------------------------
     Fireworks code
  --------------------------------------------------------- */
  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas.getContext('2d');
  let fwWidth, fwHeight;

  function fwResize() {
    fwWidth = fwCanvas.width = window.innerWidth;
    fwHeight = fwCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', fwResize);
  fwResize();

  let fireworks = [];

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createFirework() {
    const x = random(100, fwWidth - 100);
    const y = random(50, fwHeight / 2);
    const colors = ['#ff3f81', '#ffd700', '#00ffe1', '#ffb347', '#ffffff'];
    const particles = [];

    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60;
      const speed = random(2, 5);
      particles.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    fireworks.push(...particles);
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255
    ];
  }

  let fwRunning = false;
  let fwInterval;

  function drawFireworks() {
    fwCtx.clearRect(0, 0, fwWidth, fwHeight);

    fireworks = fireworks.filter(p => p.alpha > 0);
    fireworks.forEach(p => {
      fwCtx.fillStyle = p.color;
      fwCtx.globalAlpha = p.alpha;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.globalAlpha = 1;

      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.02;
    });

    if (fwRunning) {
      requestAnimationFrame(drawFireworks);
    } else {
      fwCtx.clearRect(0, 0, fwWidth, fwHeight);
    }
  }

  function startFireworks() {
    if (fwRunning) return; // already running
    fwRunning = true;
    fwInterval = setInterval(createFirework, 700);
    drawFireworks();
  }

  function stopFireworks() {
    fwRunning = false;
    clearInterval(fwInterval);
    fireworks = [];
    fwCtx.clearRect(0, 0, fwWidth, fwHeight);
  }

})(); // IIFE end

// The addSparkleToItem function is already inside the IIFE, no need to duplicate it.
