(function () {
  if (typeof TZDashboard === "undefined") return;

  var SESSION_KEY = "tz-analytics-session";
  var VISITOR_KEY = "tz-analytics-visitor";

  function readOrCreateId(key) {
    try {
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
      localStorage.setItem(key, id);
      return id;
    } catch (e) {
      return "tmp-" + Date.now();
    }
  }

  function hasConsent() {
    try {
      // Real Cookie Banner stores consent — adjust selector if needed
      return (
        document.cookie.indexOf("real_cookie_banner") !== -1 ||
        localStorage.getItem("rcb_consent") === "1"
      );
    } catch (e) {
      return true;
    }
  }

  function post(endpoint, payload) {
    var headers = { "Content-Type": "application/json" };
    if (TZDashboard.apiKey) {
      headers["X-TZ-API-Key"] = TZDashboard.apiKey;
    }

    fetch(TZDashboard.dashboardUrl + endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
    }).catch(function () {});
  }

  function sendAnalytics(payload) {
    post("/api/wordpress/analytics", payload);
  }

  function trackPageView() {
    if (!hasConsent()) return;
    sendAnalytics({
      eventType: "page_view",
      path: TZDashboard.path || window.location.pathname,
      referrer: document.referrer || "",
      sessionId: readOrCreateId(SESSION_KEY),
      visitorId: readOrCreateId(VISITOR_KEY),
    });
  }

  function resolveCtaId(el) {
    var node = el.closest("[data-analytics-cta]");
    if (node && node.dataset.analyticsCta) {
      return node.dataset.analyticsCta;
    }

    var anchor = el.closest("a");
    if (anchor) {
      var href = (anchor.getAttribute("href") || "").toLowerCase();
      if (href.indexOf("tel:") === 0) return "call";
      if (href.indexOf("wa.me") !== -1 || href.indexOf("whatsapp") !== -1) {
        return "whatsapp";
      }
      if (href.indexOf("mailto:") === 0) return "email";
      if (href.indexOf("/kontakt") !== -1) return "contact";
    }

    var text = (anchor ? anchor.textContent : el.textContent || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (text.indexOf("whatsapp") !== -1) return "whatsapp";
    if (text.indexOf("anruf") !== -1 || text.indexOf("anrufen") !== -1) {
      return "call";
    }
    if (text.indexOf("e-mail") !== -1 || text.indexOf("email") !== -1) {
      return "email";
    }

    return null;
  }

  function onClick(event) {
    if (!TZDashboard.trackCta || !hasConsent()) return;
    var ctaId = resolveCtaId(event.target);
    if (!ctaId) return;

    sendAnalytics({
      eventType: "cta_click",
      ctaId: ctaId,
      path: window.location.pathname,
      sessionId: readOrCreateId(SESSION_KEY),
      visitorId: readOrCreateId(VISITOR_KEY),
    });
  }

  document.addEventListener("click", onClick, true);
  trackPageView();
})();
