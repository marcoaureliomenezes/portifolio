function o() {
  if (typeof crypto.randomUUID == "function")
    return crypto.randomUUID();
  const t = new Uint8Array(16);
  crypto.getRandomValues(t), t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const n = Array.from(t, (d) => d.toString(16).padStart(2, "0")).join("");
  return n.slice(0, 8) + "-" + n.slice(8, 12) + "-" + n.slice(12, 16) + "-" + n.slice(16, 20) + "-" + n.slice(20);
}
const r = "dadaia_session_id";
function u() {
  try {
    const e = sessionStorage.getItem(r);
    if (e !== null)
      return e;
    const t = o();
    return sessionStorage.setItem(r, t), t;
  } catch {
    return o();
  }
}
let i = null;
const s = [];
function l(e) {
  i = e;
}
function f(e, t) {
  i && s.push({
    site_id: i.site_id,
    session_id: u(),
    event_type: e,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...t !== void 0 ? { metadata: t } : {}
  });
}
function c() {
  if (!(!i || s.length === 0))
    try {
      const e = JSON.stringify(s.splice(0)), t = new Blob([e], { type: "application/json" });
      navigator.sendBeacon(i.endpoint, t);
    } catch {
    }
}
function g() {
  document.addEventListener("visibilitychange", () => {
    document.visibilityState === "hidden" && c();
  }), window.addEventListener("pagehide", () => {
    c();
  });
}
let a = !1;
function y(e) {
  try {
    l(e), u(), a || (g(), a = !0);
  } catch {
  }
}
function p(e, t) {
  try {
    f(e, t);
  } catch {
  }
}
export {
  y as init,
  p as track
};
