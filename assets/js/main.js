/* Beta AI Apps — site behaviour. No dependencies. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header state ---------- */
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    header.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    // Content behind the open menu is unreachable for keyboard and screen readers
    document.querySelectorAll("main, footer").forEach(function (el) { el.inert = open; });
    if (open) {
      var first = menu.querySelector("a");
      if (first) first.focus();
    }
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        setMenu(false);
        toggle.focus();
      }
      // Keep focus inside the open menu
      if (e.key === "Tab" && !menu.hidden) {
        var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a")));
        var firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!reduceMotion && "IntersectionObserver" in window) {
    // Anything already on screen is shown straight away (no flash, no wait).
    var vh = window.innerHeight;
    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add("is-in");
    });
    doc.classList.add("js");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { if (!el.classList.contains("is-in")) io.observe(el); });
  }

  /* ---------- Scroll spy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      var current = null;
      Object.keys(byId).forEach(function (id) { if (visible[id] && !current) current = id; });
      navLinks.forEach(function (a) {
        var on = a === byId[current];
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Hero tilt + card spotlight (pointer devices only) ---------- */
  if (finePointer && !reduceMotion) {
    var tilt = document.querySelector("[data-tilt]");
    var device = tilt && tilt.querySelector(".device");
    if (tilt && device) {
      var raf = 0;
      tilt.addEventListener("pointermove", function (e) {
        var r = tilt.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          device.style.setProperty("--ry", (-8 + x * 14).toFixed(2) + "deg");
          device.style.setProperty("--rx", (4 - y * 10).toFixed(2) + "deg");
        });
      });
      tilt.addEventListener("pointerleave", function () {
        device.style.removeProperty("--ry");
        device.style.removeProperty("--rx");
      });
    }
    document.querySelectorAll("[data-spot]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var success = document.querySelector("[data-success]");
  var statusEl = form.querySelector("[data-status]");
  var submitBtn = form.querySelector(".submit");
  var submitLabel = form.querySelector(".submit-label");
  var message = form.elements.message;
  var counter = document.getElementById("f-message-count");
  var startedAt = Date.now();
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

  var rules = {
    name: function (v) {
      if (!v) return "Please tell us your name.";
      if (v.length < 2) return "That name looks a little short.";
      return "";
    },
    email: function (v) {
      if (!v) return "Please enter your email so we can reply.";
      if (!EMAIL_RE.test(v)) return "Please enter a valid email address, like name@company.com.";
      return "";
    },
    message: function (v) {
      if (!v) return "Please tell us a little about your project.";
      if (v.length < 20) return "A few more words would help us reply usefully (20 characters minimum).";
      return "";
    }
  };

  function clean(v) {
    // Trim, drop control characters, collapse runaway whitespace.
    return String(v || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  }

  function showError(name, msg) {
    var input = form.elements[name];
    var err = document.getElementById("f-" + name + "-err");
    if (!input || !err) return;
    err.textContent = msg;
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validate(name) {
    var msg = rules[name](clean(form.elements[name].value));
    showError(name, msg);
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener("blur", function () { if (input.value) validate(name); });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") validate(name);
    });
  });

  function updateCount() {
    if (counter) counter.textContent = message.value.length + " / " + message.maxLength;
  }
  message.addEventListener("input", updateCount);
  updateCount();

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", !!isError);
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    submitLabel.textContent = on ? "Sending…" : "Send message";
  }

  function collect() {
    var services = Array.prototype.slice.call(form.querySelectorAll('input[name="services"]:checked'))
      .map(function (c) { return c.value; });
    return {
      name: clean(form.elements.name.value).slice(0, 100),
      email: clean(form.elements.email.value).slice(0, 160),
      company: clean(form.elements.company.value).slice(0, 120),
      stage: clean(form.elements.stage.value).slice(0, 60),
      services: services.join(", "),
      message: clean(form.elements.message.value).slice(0, 4000)
    };
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.focus();
  }

  function mailtoFallback(data) {
    var to = form.getAttribute("data-email");
    var subject = "Project inquiry from " + data.name + (data.company ? " (" + data.company + ")" : "");
    var body = [
      "Name: " + data.name,
      "Email: " + data.email,
      data.company ? "Company: " + data.company : "",
      data.stage ? "Stage: " + data.stage : "",
      data.services ? "Interested in: " + data.services : "",
      "",
      data.message
    ].filter(function (l, i) { return l !== "" || i === 5; }).join("\n");
    window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");

    var ok = ["name", "email", "message"].map(validate).every(Boolean);
    if (!ok) {
      var firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      setStatus("Please check the highlighted fields.", true);
      return;
    }

    // Bots fill hidden fields and submit instantly; quietly accept and drop.
    if (form.elements.website.value || Date.now() - startedAt < 2500) {
      showSuccess();
      return;
    }

    var data = collect();
    var endpoint = form.getAttribute("data-endpoint");

    if (!endpoint) {
      mailtoFallback(data);
      setStatus("Your email app should open with the message ready to send. If it doesn’t, write to us at " + form.getAttribute("data-email") + ".");
      return;
    }

    setLoading(true);
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : 0;

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(Object.assign({ _subject: "New inquiry — betaaiapps.com", _replyto: data.email }, data)),
      signal: controller ? controller.signal : undefined,
      credentials: "omit",
      referrerPolicy: "strict-origin"
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      showSuccess();
    }).catch(function () {
      setStatus("We couldn’t send that just now. Please try again, or email us at " + form.getAttribute("data-email") + ".", true);
    }).then(function () {
      clearTimeout(timer);
      setLoading(false);
    });
  });

  var resetBtn = document.querySelector("[data-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      updateCount();
      ["name", "email", "message"].forEach(function (n) { showError(n, ""); });
      setStatus("");
      startedAt = Date.now();
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }
})();
