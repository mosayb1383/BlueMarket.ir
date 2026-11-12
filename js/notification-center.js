/* ============================================================
   NotificationCenter — Mock Backend اعلان‌ها (فقط localStorage)
  بلو مارکت 

   کلید ذخیره‌سازی: "notifications"
   ساختار هر اعلان:
   { id, type, title, message, recipientId, senderId,
     relatedId, isRead, createdAt, priority }

   recipientId:  "admin"  برای مدیر  |  شناسه‌ی کاربر (یا ایمیل) برای مشتری
   senderId:     "system" | "admin" | شناسه‌ی کاربر
   priority:     "low" | "normal" | "high"

   این فایل باید قبل از هر اسکریپتی که اعلان تولید می‌کند لود شود
   (auth.js, checkout.js, account.js, contact.js, صفحات ادمین).
   ============================================================ */
/* ============================================================
   NotificationCenter — Mock Backend اعلان‌ها + صدا
   ============================================================ */
(function () {
  "use strict";

  var KEY = "notifications";
  var MIGRATED_KEY = "notifications_migrated_v1";
  var MAX_ITEMS = 500;
  var ADMIN_ID = "admin";

  /* ---------- ابزار ذخیره‌سازی ---------- */
  function read(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object") return Object.keys(v).map(function (k) { return v[k]; });
      return [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function emitChange() {
    try {
      window.dispatchEvent(new CustomEvent("bl:notifications-changed"));
    } catch (e) {}
  }

  function uid() {
    return "ntf_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function norm(v) {
    return String(v == null ? "" : v).trim().toLowerCase();
  }

  /* ---------- 🔊 سیستم صدای اعلان ---------- */
  function playNotificationSound(type) {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      var ctx = new AudioContext();
      var osc = ctx.createOscillator();
      var gainNode = ctx.createGain();
      var freqStart = 880; // A5
      var freqEnd = 1108; // C#6
      var duration = 0.5;

      // تنظیم صدای خاص برای سفارش جدید
      if (type === "order_created") {
        freqStart = 660; // E5
        freqEnd = 880;   // A5
      } else if (type === "error" || type === "ticket_created") {
        freqStart = 440; // A4
        freqEnd = 349;   // F4
        duration = 0.7;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log("[Notification] Audio play failed", e);
    }
  }

  /* ---------- هویت کاربر ---------- */
  function currentUser() {
    try {
      var s = JSON.parse(localStorage.getItem("blUser") || "null");
      return s && s.isLoggedIn === true ? s : null;
    } catch (e) {
      return null;
    }
  }

  function idForEmail(email) {
    var e = norm(email);
    if (!e) return "";
    var users = read("registeredUsers");
    for (var i = 0; i < users.length; i++) {
      if (norm(users[i].email) === e) return String(users[i].id);
    }
    return e;
  }

  function matchesUser(n, user) {
    if (!user || n.recipientId === ADMIN_ID) return false;
    var rid = norm(n.recipientId);
    return rid === norm(user.id) || rid === norm(user.email);
  }

  /* ---------- انواع اعلان ---------- */
  var TYPES = {
    user_registered: { icon: "bi-person-plus-fill", color: "blue", admin: "users.html" },
    order_created: { icon: "bi-bag-plus-fill", color: "green", admin: "orders.html" },
    ticket_created: { icon: "bi-chat-dots-fill", color: "purple", admin: "tickets.html" },
    ticket_user_reply: { icon: "bi-reply-fill", color: "purple", admin: "tickets.html" },
    order_cancelled: { icon: "bi-x-octagon-fill", color: "red", admin: "orders.html" },
    contact_form: { icon: "bi-envelope-fill", color: "orange", admin: "notifications.html" },
    ticket_admin_reply: { icon: "bi-chat-left-text-fill", color: "purple", user: "account.html#tickets" },
    order_status: { icon: "bi-truck", color: "green", user: "account.html#orders" },
    ticket_closed: { icon: "bi-lock-fill", color: "orange", user: "account.html#tickets" },
    system: { icon: "bi-info-circle-fill", color: "orange", admin: "notifications.html", user: "notifications.html" },
  };

  function typeMeta(type) {
    return TYPES[type] || TYPES.system;
  }

  function linkFor(n) {
    var meta = typeMeta(n.type);
    return n.recipientId === ADMIN_ID
      ? meta.admin || "notifications.html"
      : meta.user || "notifications.html";
  }

  /* ---------- هسته ---------- */
  function push(data) {
    var list = read(KEY);
    var n = {
      id: uid(),
      type: data.type || "system",
      title: String(data.title || ""),
      message: String(data.message || ""),
      recipientId: data.recipientId == null ? ADMIN_ID : String(data.recipientId),
      senderId: data.senderId == null ? "system" : String(data.senderId),
      relatedId: data.relatedId == null ? null : String(data.relatedId),
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: data.priority || "normal",
    };
    list.unshift(n);
    write(list);
    emitChange();
    
    // 🔊 پخش صدا فقط برای اعلان‌های جدیدِ مهم
    if (n.priority === "high" || n.type === "order_created" || n.type === "ticket_created") {
        playNotificationSound(n.type);
    }
    
    return n;
  }

  function sortNewest(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  function forAdmin() {
    return read(KEY).filter(function (n) { return n.recipientId === ADMIN_ID; }).sort(sortNewest);
  }

  function forUser(user) {
    var u = user || currentUser();
    if (!u) return [];
    return read(KEY).filter(function (n) { return matchesUser(n, u); }).sort(sortNewest);
  }

  function list(audience) {
    return audience === "admin" ? forAdmin() : forUser();
  }

  function unreadCount(audience) {
    return list(audience).filter(function (n) { return !n.isRead; }).length;
  }

  function markRead(id) {
    var all = read(KEY);
    var changed = false;
    all.forEach(function (n) {
      if (n.id === id && !n.isRead) { n.isRead = true; changed = true; }
    });
    if (changed) { write(all); emitChange(); }
  }

  function markAllRead(audience) {
    var u = audience === "admin" ? null : currentUser();
    var all = read(KEY);
    var changed = false;
    all.forEach(function (n) {
      var mine = audience === "admin" ? n.recipientId === ADMIN_ID : matchesUser(n, u);
      if (mine && !n.isRead) { n.isRead = true; changed = true; }
    });
    if (changed) { write(all); emitChange(); }
  }

  function remove(id) {
    write(read(KEY).filter(function (n) { return n.id !== id; }));
    emitChange();
  }

  /* ---------- ۹ رویداد ---------- */
  var ORDER_STATUS_LABEL = {
    pending: "در انتظار پرداخت",
    processing: "تأیید شد و در حال پردازش است",
    shipped: "ارسال شد",
    delivered: "تحویل داده شد",
    cancelled: "لغو شد",
  };

  function money(n) {
    return (Number(n) || 0).toLocaleString("fa-IR") + " تومان";
  }

  var events = {
    userRegistered: function (user) {
      var name = (user.firstName || "") + " " + (user.lastName || "");
      return push({
        type: "user_registered",
        title: "ثبت‌نام کاربر جدید",
        message: (name.trim() || user.email || "کاربر جدید") + " در فروشگاه ثبت‌نام کرد.",
        recipientId: ADMIN_ID,
        senderId: user.id,
        relatedId: user.id,
      });
    },
    orderCreated: function (order) {
      return push({
        type: "order_created",
        title: "سفارش جدید",
        message: "سفارش " + order.id + " به مبلغ " + money(order.total) + " ثبت شد.",
        recipientId: ADMIN_ID,
        senderId: idForEmail(order.userEmail),
        relatedId: order.id,
        priority: "high",
      });
    },
    ticketCreated: function (ticket) {
      return push({
        type: "ticket_created",
        title: "تیکت جدید",
        message: "«" + ticket.subject + "» از طرف " + (ticket.userName || "کاربر"),
        recipientId: ADMIN_ID,
        senderId: idForEmail(ticket.userEmail),
        relatedId: ticket.id,
        priority: ticket.priority === "high" ? "high" : "normal",
      });
    },
    ticketUserReply: function (ticket) {
      return push({
        type: "ticket_user_reply",
        title: "پاسخ کاربر به تیکت",
        message: (ticket.userName || "کاربر") + " به تیکت «" + ticket.subject + "» پاسخ داد.",
        recipientId: ADMIN_ID,
        senderId: idForEmail(ticket.userEmail),
        relatedId: ticket.id,
      });
    },
    orderCancelledByUser: function (order) {
      return push({
        type: "order_cancelled",
        title: "لغو سفارش توسط کاربر",
        message: "سفارش " + order.id + " توسط مشتری لغو شد.",
        recipientId: ADMIN_ID,
        senderId: idForEmail(order.userEmail),
        relatedId: order.id,
        priority: "high",
      });
    },
    contactSubmitted: function (msg) {
      var who = msg.name || msg.fullName || msg.email || "بازدیدکننده";
      var subject = msg.subject ? " درباره‌ی «" + msg.subject + "»" : "";
      return push({
        type: "contact_form",
        title: "پیام جدید از فرم تماس",
        message: who + subject + " پیام فرستاد.",
        recipientId: ADMIN_ID,
        senderId: msg.email ? idForEmail(msg.email) : "guest",
        relatedId: msg.id,
      });
    },
    ticketAdminReply: function (ticket) {
      return push({
        type: "ticket_admin_reply",
        title: "پاسخ جدید به تیکت شما",
        message: "پشتیبانی به تیکت «" + ticket.subject + "» پاسخ داد.",
        recipientId: idForEmail(ticket.userEmail),
        senderId: ADMIN_ID,
        relatedId: ticket.id,
        priority: "high",
      });
    },
    orderStatusChanged: function (order, status) {
      var label = ORDER_STATUS_LABEL[status] || status;
      return push({
        type: "order_status",
        title: "به‌روزرسانی سفارش",
        message: "سفارش " + order.id + " " + label + ".",
        recipientId: idForEmail(order.userEmail),
        senderId: ADMIN_ID,
        relatedId: order.id,
        priority: status === "cancelled" ? "high" : "normal",
      });
    },
    ticketClosed: function (ticket) {
      return push({
        type: "ticket_closed",
        title: "تیکت بسته شد",
        message: "تیکت «" + ticket.subject + "» توسط پشتیبانی بسته شد.",
        recipientId: idForEmail(ticket.userEmail),
        senderId: ADMIN_ID,
        relatedId: ticket.id,
      });
    },
  };

  /* ---------- انتقال داده‌های قدیمی ---------- */
  function migrateLegacy() {
    try {
      if (localStorage.getItem(MIGRATED_KEY)) return;
      var all = read(KEY);

      read("bl_admin_notifications").forEach(function (o) {
        all.push({
          id: uid(),
          type: o.type === "user" ? "user_registered" : o.type || "system",
          title: o.title || "",
          message: o.message || "",
          recipientId: ADMIN_ID,
          senderId: "system",
          relatedId: o.refId || null,
          isRead: !!o.read,
          createdAt: o.createdAt || new Date().toISOString(),
          priority: "normal",
        });
      });

      read("bl_user_notifications").forEach(function (o) {
        all.push({
          id: uid(),
          type: o.type || "system",
          title: o.title || "",
          message: o.message || "",
          recipientId: idForEmail(o.email),
          senderId: "system",
          relatedId: o.refId || null,
          isRead: !!o.read,
          createdAt: o.createdAt || new Date().toISOString(),
          priority: "normal",
        });
      });

      read("bl_tickets").forEach(function (t) {
        if (t.adminRead === false) {
          all.push({
            id: uid(), type: "ticket_created", title: "تیکت جدید",
            message: "«" + t.subject + "» از طرف " + (t.userName || "کاربر"),
            recipientId: ADMIN_ID, senderId: idForEmail(t.userEmail), relatedId: t.id,
            isRead: false, createdAt: t.createdAt || new Date().toISOString(), priority: "normal",
          });
        }
      });

      read("bl_orders").forEach(function (o) {
        if (o.adminRead === false) {
          all.push({
            id: uid(), type: "order_created", title: "سفارش جدید",
            message: "سفارش " + o.id + " به مبلغ " + money(o.total) + " ثبت شد.",
            recipientId: ADMIN_ID, senderId: idForEmail(o.userEmail), relatedId: o.id,
            isRead: false, createdAt: o.createdAt || new Date().toISOString(), priority: "high",
          });
        }
      });

      write(all.sort(sortNewest));
      localStorage.setItem(MIGRATED_KEY, "1");
    } catch (e) {}
  }

  migrateLegacy();

  /* ---------- API عمومی ---------- */
  window.NotificationCenter = {
    KEY: KEY,
    ADMIN_ID: ADMIN_ID,
    TYPES: TYPES,
    typeMeta: typeMeta,
    linkFor: linkFor,
    push: push,
    list: list,
    forAdmin: forAdmin,
    forUser: forUser,
    unreadCount: unreadCount,
    markRead: markRead,
    markAllRead: markAllRead,
    remove: remove,
    currentUser: currentUser,
    idForEmail: idForEmail,
    events: events,
    playSound: playNotificationSound, // اضافه شد
  };
})();