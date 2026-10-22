/* ============================================================
   Ansh Agrawal — Portfolio interactions
   No dependencies. Progressive enhancement friendly.
   ============================================================ */

(function () {
  "use strict";

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------ Theme ------------------------------ */

  const themeToggle = document.getElementById("themeToggle");
  const themeColor = document.getElementById("themeColor");

  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}

    if (themeColor) {
      themeColor.setAttribute("content", theme === "light" ? "#f6f7fc" : "#06080f");
    }

    if (themeToggle) {
      const next = theme === "light" ? "dark" : "light";
      themeToggle.setAttribute("aria-label", "Switch to " + next + " theme");
      themeToggle.setAttribute("title", "Switch to " + next + " theme");
    }
  }

  if (themeToggle) {
    setTheme(root.dataset.theme === "light" ? "light" : "dark");

    themeToggle.addEventListener("click", function () {
      setTheme(root.dataset.theme === "light" ? "dark" : "light");
    });
  }

  /* ------------------------------ Header + scroll progress ------------------------------ */

  const header = document.getElementById("header");
  const progress = document.getElementById("scrollProgress");
  const scrollTopButton = document.getElementById("scrollTop");
  const footer = document.querySelector(".site-footer");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("scrolled", y > 8);
    }

    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(Math.max(y / scrollable, 0), 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }

    if (scrollTopButton) {
      const footerTop = footer ? footer.offsetTop : Number.POSITIVE_INFINITY;
      const nearFooter = y + window.innerHeight >= footerTop + 60;
      scrollTopButton.classList.toggle("visible", y > 700 && !nearFooter);
    }
  }

  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (scrollTopButton) {
    scrollTopButton.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  /* ------------------------------ Mobile navigation ------------------------------ */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    if (!navLinks || !navLinks.classList.contains("open")) return;
    navLinks.classList.remove("open");
    document.body.classList.remove("nav-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("open");
      document.body.classList.toggle("nav-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("pointerdown", function (event) {
      if (!navLinks.classList.contains("open")) return;
      if (navLinks.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ------------------------------ Active section highlight ------------------------------ */

  const sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  const navAnchors = navLinks
    ? Array.prototype.slice.call(navLinks.querySelectorAll('a[href^="#"]:not(.btn)'))
    : [];

  if (sections.length && navAnchors.length) {
    let activeFrame = null;

    function updateActiveSection() {
      activeFrame = null;

      let currentId = sections[0].id;
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= 140) {
          currentId = section.id;
        }
      });

      // At the very bottom, always highlight the last section.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        currentId = sections[sections.length - 1].id;
      }

      navAnchors.forEach(function (link) {
        const isActive = link.getAttribute("href") === "#" + currentId;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function requestActiveUpdate() {
      if (activeFrame === null) {
        activeFrame = requestAnimationFrame(updateActiveSection);
      }
    }

    document.addEventListener("scroll", requestActiveUpdate, { passive: true });
    window.addEventListener("resize", requestActiveUpdate);
    updateActiveSection();
  }

  /* ------------------------------ Reveal on scroll ------------------------------ */

  const revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    let revealFrame = null;

    // Reveal anything that has reached the viewport. Checking scroll position
    // (instead of only observing intersections) means content skipped by a
    // fast scroll or a deep link is never left invisible.
    function revealVisible() {
      revealFrame = null;
      const trigger = window.innerHeight - 50;

      revealItems.forEach(function (el) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < trigger) {
          el.classList.add("in");
        }
      });
    }

    function requestReveal() {
      if (revealFrame === null) {
        revealFrame = requestAnimationFrame(revealVisible);
      }
    }

    document.addEventListener("scroll", requestReveal, { passive: true });
    window.addEventListener("resize", requestReveal);
    revealVisible();
  }

  /* ------------------------------ Animated counters ------------------------------ */

  const counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1300;

    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    const start = performance.now();

    function tick(now) {
      const elapsed = Math.min(now - start, duration);
      const eased = 1 - Math.pow(1 - elapsed / duration, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }

  /* ------------------------------ Terminal typewriter ------------------------------ */

  const termBody = document.getElementById("termBody");

  if (termBody) {
    const script = [
      { cmd: "whoami", out: "ansh_agrawal — B.Tech CSE (AI/ML), UPES '27" },
      { cmd: "cat focus.txt", out: "applied ML · reinforcement learning · explainability" },
      {
        cmd: "python model.py --task credit-risk",
        out: "ROC-AUC 0.769 · lift 1.90x · SHAP ready ✓",
        success: true
      }
    ];

    const sleep = function (ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    };

    function addLine(className) {
      const line = document.createElement("div");
      line.className = "term-line " + className;
      termBody.appendChild(line);
      return line;
    }

    function addGap() {
      const gap = document.createElement("div");
      gap.className = "term-gap";
      termBody.appendChild(gap);
    }

    function renderStatic() {
      termBody.innerHTML = "";
      script.forEach(function (item, index) {
        if (index > 0) addGap();
        const cmdLine = addLine("cmd");
        cmdLine.innerHTML = '<span class="prompt">➜</span><span class="path">~</span> ' + escapeHtml(item.cmd);
        const outLine = addLine(item.success ? "out ok" : "out");
        outLine.textContent = item.out;
      });
      addGap();
      const finalLine = addLine("cmd");
      finalLine.innerHTML = '<span class="prompt">➜</span><span class="path">~</span> <span class="cursor"></span>';
    }

    function escapeHtml(value) {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    async function typeText(node, text, speed) {
      for (let i = 0; i < text.length; i++) {
        node.textContent += text.charAt(i);
        await sleep(speed);
      }
    }

    async function play() {
      termBody.innerHTML = "";
      await sleep(450);

      for (let index = 0; index < script.length; index++) {
        const item = script[index];
        if (index > 0) {
          addGap();
          await sleep(140);
        }

        const cmdLine = addLine("cmd");
        cmdLine.innerHTML = '<span class="prompt">➜</span><span class="path">~</span> ';
        const typed = document.createElement("span");
        cmdLine.appendChild(typed);

        const cursor = document.createElement("span");
        cursor.className = "cursor";
        cmdLine.appendChild(cursor);

        await typeText(typed, item.cmd, 24);
        cursor.remove();
        await sleep(260);

        const outLine = addLine(item.success ? "out ok" : "out");
        await typeText(outLine, item.out, 7);
        await sleep(item.success ? 220 : 300);
      }

      addGap();
      const finalLine = addLine("cmd");
      finalLine.innerHTML = '<span class="prompt">➜</span><span class="path">~</span> <span class="cursor"></span>';
    }

    if (prefersReducedMotion) {
      renderStatic();
    } else {
      play();
    }
  }

  /* ------------------------------ Spotlight hover ------------------------------ */

  if (canHover) {
    const spotlights = document.querySelectorAll(".card-spotlight");

    spotlights.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (event.clientX - rect.left) + "px");
        card.style.setProperty("--my", (event.clientY - rect.top) + "px");
      });

      card.addEventListener("pointerleave", function () {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  /* ------------------------------ Pointer glow ------------------------------ */

  const pointerGlow = document.getElementById("pointerGlow");

  if (pointerGlow && canHover && !prefersReducedMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;
    let hasMoved = false;

    function glowTick() {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      currentX += dx * 0.12;
      currentY += dy * 0.12;

      pointerGlow.style.transform =
        "translate3d(" + currentX + "px, " + currentY + "px, 0) translate(-50%, -50%)";

      if (Math.abs(dx) + Math.abs(dy) > 0.5) {
        frame = requestAnimationFrame(glowTick);
      } else {
        frame = null;
      }
    }

    window.addEventListener(
      "pointermove",
      function (event) {
        targetX = event.clientX;
        targetY = event.clientY;

        if (!hasMoved) {
          hasMoved = true;
          currentX = targetX;
          currentY = targetY;
          pointerGlow.classList.add("active");
        }

        if (frame === null) frame = requestAnimationFrame(glowTick);
      },
      { passive: true }
    );
  }

  /* ------------------------------ Copy email ------------------------------ */

  const copyButton = document.getElementById("copyEmail");
  const copyLabel = document.getElementById("copyLabel");
  const copyStatus = document.getElementById("copyStatus");
  const email = "anshagrawal887@gmail.com";
  let copyTimer;

  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      let copied = false;

      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (error) {
        // Fallback for browsers or contexts without the Clipboard API.
        try {
          const field = document.createElement("textarea");
          field.value = email;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.opacity = "0";
          document.body.appendChild(field);
          field.select();
          copied = document.execCommand("copy");
          document.body.removeChild(field);
        } catch (fallbackError) {
          copied = false;
        }
      }

      if (copyLabel) copyLabel.textContent = copied ? "Copied!" : "Copy failed";
      if (copyStatus) copyStatus.textContent = copied ? "Email address added to clipboard." : "Press Ctrl+C to copy: " + email;

      window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(function () {
        if (copyLabel) copyLabel.textContent = "Copy email";
        if (copyStatus) copyStatus.textContent = "";
      }, 2400);
    });
  }

  /* ------------------------------ Footer year ------------------------------ */

  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
