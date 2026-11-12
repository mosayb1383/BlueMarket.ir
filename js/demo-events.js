/* سازگاری با نسخه‌ی قبل — همه‌ی اعلان‌ها اکنون در NotificationCenter (کلید "notifications") ذخیره می‌شوند.
   این فایل فقط API قدیمی DemoEvents را به NotificationCenter هدایت می‌کند. */
(function () {
  "use strict";
  var NC = function () { return window.NotificationCenter; };
  window.DemoEvents = {
    notifyAdmin: function (type, title, message, refId) {
      if (!NC()) return;
      NC().push({ type: type === "user" ? "user_registered" : type, title: title, message: message, recipientId: NC().ADMIN_ID, relatedId: refId });
    },
    notifyUser: function (email, type, title, message, refId) {
      if (!NC()) return;
      NC().push({ type: type, title: title, message: message, recipientId: NC().idForEmail(email), senderId: NC().ADMIN_ID, relatedId: refId });
    },
    markAllAdminRead: function () { if (NC()) NC().markAllRead("admin"); },
    markAllUserRead: function () { if (NC()) NC().markAllRead("user"); },
    markUserRead: function (id) { if (NC()) NC().markRead(id); },
    markAdminRead: function (id) { if (NC()) NC().markRead(id); }
  };
})();
