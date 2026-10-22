/* KÄNGURUISMUS — Index, Sparring, Beutel */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- progress ---------- */
  const bar = document.getElementById("progressBar");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0).toFixed(2) + "%";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal ---------- */
  const targets = document.querySelectorAll(
    ".head, .article, .law, .letter, .fights, .record, .sparring, .plan, .rule, .calc, .stat, .quote, .outro__inner"
  );
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
  } else {
    targets.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
          const delay = Math.min(Math.max(siblings.indexOf(el), 0) * 50, 240);
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- audio ---------- */
  let ctx = null;
  let soundOn = false;

  const soundBtn = document.getElementById("soundBtn");
  const audio = () => {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const boing = () => {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(62, t + 0.26);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.34);
  };

  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundOn = !soundOn;
      soundBtn.textContent = soundOn ? "Ton: an" : "Ton: aus";
      soundBtn.setAttribute("aria-pressed", String(soundOn));
      if (soundOn) boing();
    });
  }

  /* ---------- sparring ---------- */
  const punchBtn = document.getElementById("punchBtn");
  const resetFight = document.getElementById("resetFight");
  const hpBar = document.getElementById("hpBar");
  const hpLabel = document.getElementById("hpLabel");
  const sparStatus = document.getElementById("sparringStatus");
  const sparFine = document.getElementById("sparFine");

  const rounds = [
    "Sie hält ein Formular hoch. Das Formular ist stärker als es aussieht.",
    "Treffer. Sie verlangt eine Unterschrift auf dem Formular.",
    "Sie zitiert eine Verwaltungsvorschrift. Das Känguru zitiert Artikel 4.",
    "Treffer. Ein Aktenordner fällt. Ein zweiter erscheint.",
    "Sie sagt „zuständigkeitshalber“. Das ist ein Tiefschlag und trifft trotzdem.",
    "Das Känguru findet im Beutel: einen Stempel. Der Stempel ist mächtiger als der Fausthandschuh.",
    "Sie schlägt mit Fristen zurück. Drei Tage, zwei Wochen, irgendwann.",
    "Treffer. Die Bürokratie wankt, aber ihre Email-Signatur bleibt aufrecht.",
    "Sie versucht es mit einem Gremium. Das Gremium hat keinen Vorsitzenden.",
    "KO. Der Sachbearbeiter geht in die Mittagspause. Sie dauert bis 2031."
  ];

  const states = [
    "100 / 100", "90 / 100", "80 / 100", "70 / 100", "60 / 100",
    "50 / 100", "40 / 100", "30 / 100", "20 / 100", "10 / 100", "0 / 100"
  ];

  let hits = 0;

  const renderFight = () => {
    const hp = Math.max(100 - hits * 10, 0);
    if (hpBar) hpBar.style.width = hp + "%";
    if (hpLabel) hpLabel.textContent = states[Math.min(hits, 10)];
    if (sparStatus) {
      sparStatus.textContent =
        hits === 0
          ? rounds[0]
          : hits >= 10
            ? "KO. Die Bürokratie liegt zwischen zwei Aktendeckeln. Sie wird wiederkommen, aber heute nicht."
            : rounds[Math.min(hits, 9)];
    }
    if (sparFine) {
      sparFine.textContent =
        "Tritte: " + hits + ". Sachbearbeiter: " + (hits >= 10 ? "außer Gefecht" : "unentschuldigt") + ". Keine Bürokratie wurde dauerhaft beschädigt.";
    }
    if (punchBtn) {
      punchBtn.textContent = hits >= 10 ? "NOCHMAL" : "BOING";
    }
  };

  const punch = () => {
    if (hits >= 10) {
      hits = 0;
      renderFight();
      boing();
      return;
    }
    hits += 1;
    renderFight();
    boing();
    if (!reduceMotion && hpBar) {
      hpBar.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(0)" }],
        { duration: 180, easing: "ease-out" }
      );
    }
  };

  if (punchBtn) punchBtn.addEventListener("click", punch);
  if (resetFight) {
    resetFight.addEventListener("click", () => {
      hits = 0;
      renderFight();
    });
  }
  renderFight();

  /* ---------- Känguru-Index ---------- */
  const jumps = document.getElementById("jumps");
  const back = document.getElementById("back");
  const bag = document.getElementById("bag");
  const roundInput = document.getElementById("rounds");

  const outs = {
    jumps: document.getElementById("jumpsOut"),
    back: document.getElementById("backOut"),
    bag: document.getElementById("bagOut"),
    rounds: document.getElementById("roundsOut")
  };

  const scoreNum = document.getElementById("scoreNum");
  const scoreBar = document.getElementById("scoreBar");
  const rankEl = document.getElementById("rank");
  const verdictEl = document.getElementById("verdict");
  const nextStepEl = document.getElementById("nextStep");

  const ranks = [
    { max: 20, rank: "Sitzkänguru", verdict: "Du bist noch nicht bereit. Setz dich hin. Aber nicht rückwärts.", next: "Nächster Schritt: aufstehen. Vorwärts, nicht zurück." },
    { max: 40, rank: "Beutel-Praktikant", verdict: "Der Beutel ist gepackt, die Richtung stimmt. Nach vorne, bitte.", next: "Nächster Schritt: Beutel schließen, Tür zu, Sprung." },
    { max: 60, rank: "Springender Angestellter", verdict: "Solide. Du springst, du zahlst Miete, du kommst pünktlich. Noch ist Luft nach oben.", next: "Nächster Schritt: eine Runde gegen den Montag." },
    { max: 80, rank: "Alpha-Beuteltier", verdict: "Respekt. Du boxt gegen den Montag und gewinnst nach Punkten. Am Donnerstag.", next: "Nächster Schritt: Mietverwaltung anrufen. Nicht verhandeln. Springen." },
    { max: 100, rank: "Känguru-Papst", verdict: "Du gehst nicht rückwärts, du kommst an. Die Hausverwaltung hat aufgegeben. Glückwunsch.", next: "Nächster Schritt: keiner. Du bist angekommen. Rückwärts: verboten." }
  ];

  const compute = () => {
    if (!jumps || !back || !bag || !roundInput) return;
    const j = Number(jumps.value);
    const b = Number(back.value);
    const g = Number(bag.value);
    const r = Number(roundInput.value);

    if (outs.jumps) outs.jumps.textContent = String(j);
    if (outs.back) outs.back.textContent = String(b);
    if (outs.bag) outs.bag.textContent = String(g);
    if (outs.rounds) outs.rounds.textContent = String(r);

    const raw = (j / 80) * 35 + (g / 40) * 30 + (r / 12) * 25 + (1 - b / 20) * 10;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    if (scoreNum) scoreNum.textContent = String(score);
    if (scoreBar) scoreBar.style.width = score + "%";

    const tier = ranks.find((t) => score <= t.max) || ranks[ranks.length - 1];
    if (rankEl) rankEl.textContent = tier.rank;
    if (verdictEl) verdictEl.textContent = tier.verdict;
    if (nextStepEl) nextStepEl.textContent = tier.next;
  };

  [jumps, back, bag, roundInput].forEach((input) => {
    if (input) input.addEventListener("input", compute);
  });
  compute();

  /* ---------- Rückwärts-Verweigerung ---------- */
  const backBtn = document.getElementById("backBtn");
  const toast = document.getElementById("toast");
  let toastTimer = null;

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-on"), 2800);
  };

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showToast("Rückwärts verweigert. Das ist der ganze Punkt.");
      if (!reduceMotion) {
        backBtn.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
          { duration: 240, easing: "ease-in-out" }
        );
      }
    });
  }

  /* ---------- Logo-Hop (5 Klicks) ---------- */
  const brand = document.getElementById("brand");
  let brandClicks = 0;
  let brandTimer = null;

  const hop = () => {
    if (reduceMotion) return;
    const el = document.createElement("div");
    el.className = "hopper";
    el.innerHTML = '<svg viewBox="-6 46 1064 652"><use href="#kang"></use></svg>';
    el.style.top = 30 + Math.random() * 40 + "vh";
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 3600);
  };

  if (brand) {
    brand.addEventListener("click", (e) => {
      e.preventDefault();
      brandClicks += 1;
      window.clearTimeout(brandTimer);
      brandTimer = window.setTimeout(() => {
        brandClicks = 0;
      }, 1600);
      brand.classList.remove("is-hopped");
      void brand.offsetWidth;
      brand.classList.add("is-hopped");
      if (brandClicks >= 5) {
        brandClicks = 0;
        hop();
        showToast("Fünf Klicks. Das Känguru ist los.");
      }
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
