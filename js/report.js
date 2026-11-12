(() => {
  'use strict';
  const KEY = 'bl_bug_reports';
  const form = document.getElementById('bugReportForm');
  if (!form) return;
  const message = document.getElementById('reportMessage');
  const count = document.getElementById('reportCharCount');
  const feedback = document.getElementById('reportFeedback');
  const faNumber = n => Number(n || 0).toLocaleString('fa-IR');
  message?.addEventListener('input', () => { if (count) count.textContent = faNumber(message.value.length); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('reportName').value.trim();
    const title = document.getElementById('reportTitle').value.trim();
    const body = message.value.trim();
    if (!name || !title || body.length < 12 || !document.getElementById('reportConsent').checked) {
      feedback.className = 'bug-report-feedback is-error';
      feedback.textContent = 'نام، عنوان، شرح حداقل ۱۲ حرفی و تأیید ذخیره‌سازی را تکمیل کنید.';
      return;
    }
    let reports = [];
    try { reports = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(reports)) reports = []; } catch (_) {}
    const report = {
      id: `BUG-${Date.now().toString(36).toUpperCase()}`,
      name, contact: document.getElementById('reportEmail').value.trim(),
      type: document.getElementById('reportType').value, title, message: body,
      page: location.pathname.split('/').pop() || 'index.html',
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      status: 'new', createdAt: new Date().toISOString()
    };
    reports.unshift(report);
    try {
      localStorage.setItem(KEY, JSON.stringify(reports.slice(0, 200)));
      feedback.className = 'bug-report-feedback is-success';
      feedback.innerHTML = `<i class="bi bi-check-circle-fill"></i> گزارش شما با شناسه <strong>${report.id}</strong> در همین مرورگر ثبت شد.`;
      form.reset(); if (count) count.textContent = '۰';
    } catch (_) {
      feedback.className = 'bug-report-feedback is-error';
      feedback.textContent = 'ذخیره گزارش ممکن نشد؛ فضای ذخیره‌سازی مرورگر را بررسی کنید.';
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    Promise.all(['components/header.html','components/footer.html'].map(path => fetch(path).then(r => { if (!r.ok) throw new Error(path); return r.text(); })))
      .then(([header, footer]) => {
        const h = document.getElementById('header-placeholder'), f = document.getElementById('footer-placeholder');
        if (h) h.innerHTML = header; if (f) f.innerHTML = footer;
        window.dispatchEvent(new CustomEvent('bl:header-ready'));
        window.updateAuthUI?.();
      }).catch(err => console.warn('کامپوننت‌های صفحه گزارش بارگذاری نشدند:', err));
  });
})();
