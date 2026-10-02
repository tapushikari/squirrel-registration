(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const scene = $("#scene");
  const squirrel = $("#squirrel");
  const magicBox = $("#magicBox");
  const authWrap = $("#authWrap");
  const progressFill = $(".progress-fill");
  const storyTitle = $("#storyTitle");
  const storyText = $("#storyText");
  const soundBtn = $("#soundBtn");
  const replayBtn = $("#replayBtn");
  const closeAuth = $("#closeAuth");
  const toast = $("#toast");
  const loginForm = $("#loginForm");
  const registerForm = $("#registerForm");
  const success = $("#success");
  const successTitle = $("#successTitle");
  const successText = $("#successText");

  let timers = [];
  let soundOn = false;
  let audioCtx = null;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
  }

  function tone(freq, duration = .12, type = "sine") {
    if (!soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.08, audioCtx.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration + .03);
    } catch (_) {}
  }

  function resetAuth() {
    authWrap.classList.remove("show");
    authWrap.setAttribute("aria-hidden", "true");
    scene.classList.remove("auth-open");
    success.classList.remove("show");
    loginForm.style.display = "";
    registerForm.style.display = "";
    setMode("login");
  }

  function setMode(mode) {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    document.querySelectorAll(".switch-btn").forEach(() => {});
    loginForm.classList.toggle("active", mode === "login");
    registerForm.classList.toggle("active", mode === "register");
    $("#authTitle").textContent = mode === "login" ? "Enter the forest." : "Make your little account.";
    $("#authSubtitle").textContent = mode === "login"
      ? "Sign in to continue your little journey."
      : "Register once, then come back whenever you like.";
  }

  function openAuth() {
    authWrap.classList.add("show");
    authWrap.setAttribute("aria-hidden", "false");
    scene.classList.add("auth-open");
    tone(660, .12);
    later(() => tone(880, .18), 100);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    later(() => toast.classList.remove("show"), 2600);
  }

  function replay() {
    clearTimers();
    resetAuth();
    magicBox.classList.remove("open");
    squirrel.style.opacity = "1";
    squirrel.style.left = "";
    squirrel.style.bottom = "";
    squirrel.style.transform = "";
    storyTitle.textContent = "A quiet house in the woods…";
    storyText.textContent = "Someone is waiting on the old roof.";
    progressFill.style.width = "0%";

    // Let the browser paint the reset before starting the next animation.
    requestAnimationFrame(() => {
      later(() => {
        storyTitle.textContent = "Something is moving on the roof…";
        storyText.textContent = "A tiny visitor is coming down.";
        progressFill.style.width = "22%";
        tone(330, .1);
      }, 900);

      later(() => {
        squirrel.style.left = "50%";
        squirrel.style.bottom = "39%";
        squirrel.style.transform = "translateX(-50%) scale(.92)";
        storyTitle.textContent = "Down from the roof…";
        storyText.textContent = "The little squirrel is heading for the box.";
        progressFill.style.width = "48%";
        tone(440, .1);
      }, 2200);

      later(() => {
        squirrel.style.left = "69%";
        squirrel.style.bottom = "22%";
        squirrel.style.transform = "translateX(-50%) scale(.72)";
        storyTitle.textContent = "A mysterious box…";
        storyText.textContent = "What could be waiting inside?";
        progressFill.style.width = "70%";
        tone(520, .12);
      }, 4300);

      later(() => {
        magicBox.classList.add("open");
        storyTitle.textContent = "The box opens…";
        storyText.textContent = "A little doorway is waiting for you.";
        progressFill.style.width = "88%";
        tone(700, .18, "triangle");
      }, 5900);

      later(() => {
        progressFill.style.width = "100%";
        openAuth();
      }, 6900);
    });
  }

  document.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  document.querySelectorAll(".show-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "♫" : "♪";
    if (soundOn) tone(520, .1);
  });

  replayBtn.addEventListener("click", replay);
  closeAuth.addEventListener("click", resetAuth);

  $("#forgotBtn").addEventListener("click", () => {
    showToast("For this demo, password recovery is not connected to email.");
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const password = $("#loginPassword").value;
    const saved = JSON.parse(localStorage.getItem("forestlyUser") || "null");

    if (!email || !password) return showToast("Please enter your email and password.");
    if (!saved) return showToast("No account found. Please register first.");
    if (saved.email !== email || saved.password !== password) return showToast("Email or password is incorrect.");

    if ($("#remember").checked) localStorage.setItem("forestlyRemember", email);
    successTitle.textContent = `Welcome, ${saved.name.split(" ")[0]}!`;
    successText.textContent = "You have successfully entered the little house.";
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    success.classList.add("show");
    tone(660, .12); later(() => tone(880, .18), 120);
  });

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#regName").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();
    const password = $("#regPassword").value;
    const terms = $("#terms").checked;

    if (!name || !email || !password) return showToast("Please complete every field.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return showToast("Please enter a valid email.");
    if (password.length < 6) return showToast("Password must be at least 6 characters.");
    if (!terms) return showToast("Please accept the demo terms.");

    const saved = JSON.parse(localStorage.getItem("forestlyUser") || "null");
    if (saved && saved.email === email) return showToast("This email is already registered.");

    localStorage.setItem("forestlyUser", JSON.stringify({ name, email, password }));
    successTitle.textContent = "Account created!";
    successText.textContent = "Your little account is ready. You can now enter the house.";
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    success.classList.add("show");
    tone(660, .12); later(() => tone(880, .18), 120);
  });

  $("#successBack").addEventListener("click", () => {
    success.classList.remove("show");
    loginForm.style.display = "";
    registerForm.style.display = "";
    setMode("login");
    $("#loginEmail").value = localStorage.getItem("forestlyRemember") || $("#regEmail").value || "";
    $("#loginPassword").focus();
  });

  // Escape closes the modal.
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && authWrap.classList.contains("show")) resetAuth();
  });

  // Start automatically. A hard safety fallback opens authentication even if an animation is interrupted.
  window.addEventListener("load", () => {
    replay();
    later(() => {
      if (!authWrap.classList.contains("show")) openAuth();
    }, 9000);
  });
})();
