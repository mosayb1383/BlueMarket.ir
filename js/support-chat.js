/* چت‌بات پشتیبانی — بلو مارکت (رنگ نارنجی) */
(function () {
  "use strict";
  if (document.getElementById("sn-support-root")) return;
  const KEY = "bl_support_chat_v1";
  const TICKET_KEY = "bl_tickets";
  const css = `#sn-support-root{position:fixed;z-index:1029;right:22px;bottom:22px;font-family:inherit;direction:rtl}#sn-chat-toggle{border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#fb923c,#f97316,#ea580c);color:#fff;box-shadow:0 10px 30px rgba(249,115,22,.35);display:flex;align-items:center;gap:9px;font-weight:800;cursor:pointer;transition:transform .2s}#sn-chat-toggle:hover{transform:translateY(-2px)}#sn-chat-toggle .sn-dot{width:9px;height:9px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 4px #4ade8033}#sn-chat-panel{display:none;position:absolute;right:0;bottom:66px;width:min(360px,calc(100vw - 28px));height:min(510px,calc(100dvh - 110px));background:#fff;color:#172033;border:1px solid #e5e7eb;border-radius:20px;box-shadow:0 20px 60px rgba(249,115,22,.2);overflow:hidden;flex-direction:column}#sn-chat-panel.open{display:flex}#sn-chat-head{padding:15px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;display:flex;align-items:center;justify-content:space-between}#sn-chat-head strong{display:block;font-size:15px}#sn-chat-head small{opacity:.9}#sn-chat-close{border:0;background:#ffffff22;color:#fff;border-radius:9px;width:32px;height:32px;font-size:20px;cursor:pointer}#sn-chat-messages{padding:13px;overflow:auto;flex:1;background:#f6f8fc;display:flex;flex-direction:column;gap:9px}.sn-msg{max-width:86%;padding:10px 12px;border-radius:14px;font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.sn-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e5eaf2;border-bottom-right-radius:4px}.sn-msg.user{align-self:flex-end;background:#ffe7d6;color:#7c2d12;border-bottom-left-radius:4px}#sn-chat-quick{padding:8px 10px;display:flex;gap:6px;overflow:auto;background:#fff;border-top:1px solid #edf0f5}#sn-chat-quick button{white-space:nowrap;border:1px solid #fed7aa;border-radius:20px;background:#fff;padding:6px 9px;font-size:11px;color:#ea580c;cursor:pointer;font-weight:700}#sn-chat-quick button:hover{background:#fff7ed}#sn-chat-form{display:flex;gap:7px;padding:10px;background:#fff;border-top:1px solid #edf0f5}#sn-chat-input{min-width:0;flex:1;border:1px solid #cbd5e1;border-radius:12px;padding:10px;font:inherit;font-size:13px;outline:none}#sn-chat-input:focus{border-color:#f97316}#sn-chat-send{border:0;border-radius:12px;background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;padding:0 15px;font-weight:700;cursor:pointer}#sn-chat-note{text-align:center;font-size:10px;color:#94a3b8;padding:3px 8px 7px;background:#fff}@media(max-width:600px){#sn-support-root{right:12px;bottom:calc(84px + env(safe-area-inset-bottom, 0px));}#sn-chat-toggle{padding:12px 15px;font-size:13px}#sn-chat-panel{position:fixed;right:10px;left:10px;bottom:calc(150px + env(safe-area-inset-bottom, 0px));width:auto;height:min(72dvh,560px);border-radius:18px}#sn-chat-messages{padding:11px}.sn-msg{font-size:13px}}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  const root = document.createElement("div");
  root.id = "sn-support-root";
  root.innerHTML = `<section id="sn-chat-panel" aria-label="پشتیبانی آنلاین"><header id="sn-chat-head"><div><strong>پشتیبانی ۲۴ ساعته</strong><small><span style="color:#86efac">● آنلاین</span> · پاسخ‌گوی هوشمند</small></div><button id="sn-chat-close" aria-label="بستن">×</button></header><div id="sn-chat-messages" aria-live="polite"></div><div id="sn-chat-quick"><button data-q="پیگیری سفارش">پیگیری سفارش</button><button data-q="راهنمای خرید">راهنمای خرید</button><button data-q="گارانتی محصولات">گارانتی</button><button data-q="ارتباط با پشتیبانی">ارتباط با پشتیبانی</button></div><form id="sn-chat-form"><input id="sn-chat-input" placeholder="پیامت رو بنویس..." autocomplete="off"/><button id="sn-chat-send" type="submit">ارسال</button></form><div id="sn-chat-note">گفتگو در همین مرورگر ذخیره می‌شود.</div></section><button id="sn-chat-toggle"><span class="sn-dot"></span> پشتیبانی آنلاین ۲۴/۷</button>`;
  document.body.appendChild(root);
  const panel = root.querySelector("#sn-chat-panel"),
    messages = root.querySelector("#sn-chat-messages"),
    input = root.querySelector("#sn-chat-input");
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    history = [];
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(history.slice(-80)));
    } catch (e) {}
  }
  function syncTicket(text) {
    try {
      const u = JSON.parse(localStorage.getItem("blUser") || "{}");
      const email = u.email || "مهمان";
      const tickets = JSON.parse(localStorage.getItem(TICKET_KEY) || "[]");
      let ticket = tickets.find(
        (t) =>
          t.source === "support-chat" &&
          t.userEmail === email &&
          t.status !== "closed",
      );
      const now = new Date().toISOString();
      if (!ticket) {
        ticket = {
          id: "chat_" + Date.now(),
          subject: "گفتگوی پشتیبانی آنلاین",
          userName: u.name || "کاربر مهمان",
          userEmail: email,
          userPhone: u.phone || "",
          status: "open",
          adminRead: false,
          userRead: true,
          source: "support-chat",
          createdAt: now,
          updatedAt: now,
          messages: [],
        };
        tickets.unshift(ticket);
      }
      ticket.messages.push({
        id: "msg_" + Date.now(),
        from: "user",
        authorName: u.name || "کاربر",
        text,
        createdAt: now,
      });
      ticket.adminRead = false;
      ticket.userRead = true;
      ticket.updatedAt = now;
      localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));
      window.dispatchEvent(
        new CustomEvent("bl:ticket-updated", { detail: ticket }),
      );
    } catch (e) {}
  }
  function add(text, who, store = true) {
    const el = document.createElement("div");
    el.className = "sn-msg " + who;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    if (store) {
      history.push({ text, who, at: Date.now() });
      save();
    }
  }
  function syncAdminReplies() {
    try {
      const u = JSON.parse(localStorage.getItem("blUser") || "{}");
      const email = u.email || "مهمان";
      const tickets = JSON.parse(localStorage.getItem(TICKET_KEY) || "[]");
      const ticket = tickets.find(
        (t) => t.source === "support-chat" && t.userEmail === email,
      );
      if (!ticket) return;
      ticket.messages
        .filter((m) => m.from === "admin")
        .forEach((m) => {
          if (!history.some((h) => h.id === m.id)) {
            const item = {
              id: m.id,
              text: "پشتیبانی: " + m.text,
              who: "bot",
              at: new Date(m.createdAt || Date.now()).getTime(),
            };
            history.push(item);
            const el = document.createElement("div");
            el.className = "sn-msg bot";
            el.textContent = item.text;
            messages.appendChild(el);
            messages.scrollTop = messages.scrollHeight;
            save();
          }
        });
    } catch (e) {}
  }
  function answer(q) {
    const t = q.toLowerCase();
    if (/سلام|درود|hi|hello/.test(t))
      return "سلام! خوش اومدی 🌟 من دستیار پشتیبانی بلو مارکت هستم. درباره خرید، سفارش یا محصولات چه کمکی از دستم برمیاد؟";
    if (/سفارش|پیگیری/.test(t))
      return "برای پیگیری سفارش، وارد حساب کاربری شو و از بخش «سفارش‌های من» وضعیت سفارش را ببین.";
    if (/خرید|سبد|پرداخت/.test(t))
      return "برای خرید، محصول را انتخاب کن، به سبد خرید اضافه کن و مراحل ثبت سفارش را انجام بده.";
    if (/گارانتی|ضمانت/.test(t))
      return "مدت و شرایط گارانتی هر محصول در صفحه مشخصات همان محصول درج شده است.";
    if (/قیمت|موجود/.test(t))
      return "قیمت و موجودی هر کالا در صفحه محصول نمایش داده می‌شود.";
    if (/ارتباط|پشتیبان|تماس/.test(t))
      return "پیام شما در تیکت پشتیبانی همین مرورگر ثبت شد.";
    if (/ارسال|پست|تحویل/.test(t))
      return "اطلاعات روش ارسال در صفحه محصول و مرحله ثبت سفارش نمایش داده می‌شود.";
    return "پیامت دریافت شد 🙌 درباره خرید، قیمت، موجودی، گارانتی یا پیگیری سفارش سؤال کن.";
  }
  history.forEach((x) => add(x.text, x.who, false));
  if (!history.length)
    add(
      "سلام! 👋 خوش اومدی به بلو مارکت. پشتیبانی ۲۴ ساعته فعاله؛ چطور می‌تونم کمکت کنم؟",
      "bot",
    );
  syncAdminReplies();
  window.addEventListener("storage", (e) => {
    if (e.key === TICKET_KEY) syncAdminReplies();
  });
  setInterval(syncAdminReplies, 1800);
  root.querySelector("#sn-chat-toggle").addEventListener("click", () => {
    panel.classList.add("open");
    input.focus();
  });
  root
    .querySelector("#sn-chat-close")
    .addEventListener("click", () => panel.classList.remove("open"));
  function send(q) {
    q = (q || "").trim();
    if (!q) return;

    // چک کردن لاگین
    if (typeof requireLogin === "function") {
      if (!requireLogin("ارسال پیام به پشتیبانی")) {
        add("لطفاً برای ارسال پیام ابتدا وارد حساب کاربری خود شوید.", "bot");
        return;
      }
    }

    add(q, "user");
    syncTicket(q);
    input.value = "";
    setTimeout(() => add(answer(q), "bot"), 220);
  }
  root.querySelector("#sn-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });
  root
    .querySelectorAll("#sn-chat-quick button")
    .forEach((b) => b.addEventListener("click", () => send(b.dataset.q)));
})();
