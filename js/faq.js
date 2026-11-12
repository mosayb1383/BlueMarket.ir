/* ============================================
   صفحه سوالات متداول — موبایلی بلوچستان
   ============================================ */

"use strict";

const FAQPage = {
  state: {
    activeCategory: "all",
    searchTerm: "",
    openItemId: null,
  },

  // ========== دسته‌بندی‌ها ==========
  categories: [
    {
      id: "all",
      label: "همه سوالات",
      shortLabel: "همه",
      icon: "bi-grid-3x3-gap-fill",
    },
    {
      id: "order",
      label: "سفارش و خرید",
      shortLabel: "سفارش",
      icon: "bi-bag-check",
    },
    {
      id: "shipping",
      label: "ارسال و تحویل",
      shortLabel: "ارسال",
      icon: "bi-truck",
    },
    {
      id: "payment",
      label: "پرداخت",
      shortLabel: "پرداخت",
      icon: "bi-credit-card",
    },
    {
      id: "warranty",
      label: "گارانتی",
      shortLabel: "گارانتی",
      icon: "bi-shield-check",
    },
    {
      id: "return",
      label: "مرجوعی",
      shortLabel: "مرجوعی",
      icon: "bi-arrow-return-left",
    },
    {
      id: "account",
      label: "حساب کاربری",
      shortLabel: "حساب",
      icon: "bi-person-circle",
    },
    {
      id: "product",
      label: "محصولات",
      shortLabel: "محصولات",
      icon: "bi-phone",
    },
  ],

  // ========== لیست سوالات ==========
  questions: [
    // ===== سفارش و خرید =====
    {
      id: "q-order-1",
      category: "order",
      question: "چگونه می‌توانم در فروشگاه ثبت سفارش کنم؟",
      answer: `
                <p>برای ثبت سفارش در فروشگاه موبایلی بلوچستان مراحل زیر را دنبال کنید:</p>
                <ol>
                    <li>ابتدا وارد <a href="auth.html">حساب کاربری</a> خود شوید یا <a href="auth.html">ثبت‌نام</a> کنید.</li>
                    <li>محصول مورد نظر خود را جستجو کرده و به سبد خرید اضافه کنید.</li>
                    <li>به صفحه <a href="cart.html">سبد خرید</a> رفته و تعداد را بررسی کنید.</li>
                    <li>روی دکمه «تکمیل خرید» کلیک کرده و آدرس و روش ارسال را انتخاب کنید.</li>
                    <li>پس از تأیید نهایی و پرداخت، سفارش شما ثبت می‌شود.</li>
                </ol>
                <p>پس از ثبت سفارش، شماره پیگیری از طریق پیامک و ایمیل برای شما ارسال خواهد شد.</p>
            `,
    },
    {
      id: "q-order-2",
      category: "order",
      question: "حداقل مبلغ سفارش چقدر است؟",
      answer: `
                <p>در فروشگاه موبایلی بلوچستان <strong>حداقل مبلغی برای ثبت سفارش وجود ندارد</strong>. شما می‌توانید حتی برای یک محصول سبک مانند کابل یا قاب هم سفارش ثبت کنید.</p>
                <p>البته برای بهره‌مندی از <strong>ارسال رایگان</strong>، باید مبلغ سبد خرید شما بیش از ۵۰۰,۰۰۰ تومان باشد.</p>
            `,
    },
    {
      id: "q-order-3",
      category: "order",
      question: "آیا می‌توانم سفارش خود را ویرایش یا لغو کنم؟",
      answer: `
                <p>بله، اما به شرایط زیر توجه کنید:</p>
                <ul>
                    <li><strong>تا ۲ ساعت پس از ثبت سفارش:</strong> می‌توانید از طریق پنل کاربری یا تماس با پشتیبانی، سفارش را ویرایش یا لغو کنید.</li>
                    <li><strong>پس از ارسال:</strong> امکان لغو وجود ندارد اما می‌توانید از <a href="refund.html">رویه بازگشت کالا</a> استفاده کنید.</li>
                </ul>
                <p>در صورت لغو سفارش، مبلغ حداکثر طی ۷۲ ساعت به حساب شما بازگردانده می‌شود.</p>
            `,
    },

    // ===== ارسال و تحویل =====
    {
      id: "q-ship-1",
      category: "shipping",
      question: "هزینه ارسال چقدر است؟",
      answer: `
                <p>هزینه ارسال بسته به روش انتخابی متفاوت است:</p>
                <ul>
                    <li><strong>ارسال عادی:</strong> ۳۰,۰۰۰ تومان (۳ تا ۵ روز کاری)</li>
                    <li><strong>ارسال سریع:</strong> ۵۰,۰۰۰ تومان (۱ تا ۲ روز کاری)</li>
                    <li><strong>ارسال فوری:</strong> ۱۰۰,۰۰۰ تومان (تحویل در همان روز، فقط زاهدان)</li>
                </ul>
                <p><strong>ارسال رایگان:</strong> برای خریدهای بالای ۵۰۰,۰۰۰ تومان، روش ارسال عادی <strong>رایگان</strong> است.</p>
            `,
    },
    {
      id: "q-ship-2",
      category: "shipping",
      question: "سفارش من چند روزه به دستم می‌رسد؟",
      answer: `
                <p>زمان تحویل سفارش بستگی به موقعیت جغرافیایی شما و روش ارسال انتخابی دارد:</p>
                <ul>
                    <li><strong>زاهدان:</strong> ۱ روز کاری</li>
                    <li><strong>شهرستان‌های سیستان و بلوچستان:</strong> ۲ تا ۳ روز کاری</li>
                    <li><strong>سایر استان‌ها:</strong> ۳ تا ۵ روز کاری</li>
                </ul>
                <p>پس از ارسال، <strong>کد رهگیری پستی</strong> از طریق پیامک برای شما ارسال می‌شود.</p>
            `,
    },
    {
      id: "q-ship-3",
      category: "shipping",
      question: "آیا امکان ارسال به تمام نقاط ایران وجود دارد؟",
      answer: `
                <p>بله، ما به <strong>تمام نقاط ایران</strong> ارسال داریم. از طریق پست پیشتاز و تیپاکس به همه شهرها و روستاهای کشور ارسال انجام می‌شود.</p>
                <p>فقط برای برخی مناطق دورافتاده ممکن است ۱ یا ۲ روز به زمان تحویل اضافه شود.</p>
            `,
    },

    // ===== پرداخت =====
    {
      id: "q-pay-1",
      category: "payment",
      question: "چه روش‌های پرداختی پشتیبانی می‌شود؟",
      answer: `
                <p>در حال حاضر روش‌های زیر فعال هستند:</p>
                <ul>
                    <li><strong>پرداخت آنلاین:</strong> از طریق تمام کارت‌های بانکی عضو شتاب</li>
                    <li><strong>کارت به کارت:</strong> پس از ثبت سفارش، شماره کارت از طریق پیامک ارسال می‌شود</li>
                </ul>
                <p><strong>پرداخت در محل</strong> و <strong>کیف پول</strong> به‌زودی اضافه خواهند شد.</p>
            `,
    },
    {
      id: "q-pay-2",
      category: "payment",
      question: "آیا پرداخت امن است؟",
      answer: `
                <p>بله، پرداخت‌ها از طریق <strong>درگاه‌های بانکی معتبر</strong> با پروتکل امن SSL انجام می‌شود.</p>
                <p>اطلاعات کارت شما هرگز در سرورهای ما ذخیره نمی‌شود و به‌طور مستقیم به بانک ارسال می‌گردد.</p>
                <p>ما هیچ‌گاه رمز دوم، CVV2 یا تاریخ انقضای کارت شما را درخواست نمی‌کنیم.</p>
            `,
    },
    {
      id: "q-pay-3",
      category: "payment",
      question: "اگر پرداخت انجام شد اما سفارش ثبت نشد چه کنم؟",
      answer: `
                <p>در این حالت نگران نباشید. مبلغ کسر شده حداکثر ظرف <strong>۷۲ ساعت</strong> به حساب شما بازگردانده می‌شود.</p>
                <p>لطفاً با پشتیبانی تماس بگیرید و <strong>شماره پیگیری تراکنش</strong> را ارائه دهید تا سریع‌تر بررسی شود.</p>
                <p>شماره پشتیبانی: <strong style="direction:ltr;display:inline-block;">09229480252</strong></p>
            `,
    },

    // ===== گارانتی =====
    {
      id: "q-war-1",
      category: "warranty",
      question: "محصولات دارای چه نوع گارانتی هستند؟",
      answer: `
                <p>تمامی محصولات ما دارای گارانتی معتبر هستند:</p>
                <ul>
                    <li><strong>گوشی موبایل:</strong> ۱۸ ماه گارانتی شرکتی</li>
                    <li><strong>لپ‌تاپ:</strong> ۲۴ ماه گارانتی شرکتی</li>
                    <li><strong>تبلت و ساعت هوشمند:</strong> ۱۲ ماه گارانتی</li>
                    <li><strong>لوازم جانبی:</strong> ۶ تا ۱۲ ماه گارانتی</li>
                </ul>
                <p>گارانتی‌ها از معتبرترین شرکت‌های خدمات پس از فروش کشور ارائه می‌شوند.</p>
            `,
    },
    {
      id: "q-war-2",
      category: "warranty",
      question: "ضمانت اصالت کالا به چه معناست؟",
      answer: `
                <p>یعنی محصولی که به دست شما می‌رسد <strong>۱۰۰٪ اورجینال و اصل</strong> است.</p>
                <p>ما هیچ محصول غیراورجینال، ریمارک یا استوک را نمی‌فروشیم. اگر پس از دریافت، اثبات شد که محصول غیراصل است، <strong>علاوه بر بازگشت کامل مبلغ، دو برابر قیمت را به عنوان خسارت پرداخت می‌کنیم</strong>.</p>
            `,
    },
    {
      id: "q-war-3",
      category: "warranty",
      question: "اگر محصول در طول گارانتی خراب شود چه کنم؟",
      answer: `
                <p>در صورت بروز مشکل، مراحل زیر را انجام دهید:</p>
                <ol>
                    <li>با پشتیبانی ما تماس بگیرید و مشکل را شرح دهید.</li>
                    <li>پس از تأیید، محصول را با بسته‌بندی اصلی به شرکت گارانتی ارسال کنید.</li>
                    <li>در صورت تأیید ایراد توسط کارشناس، تعمیر یا تعویض انجام می‌شود.</li>
                </ol>
                <p>هزینه ارسال محصول به شرکت گارانتی در ۳۰ روز اول، به عهده ماست.</p>
            `,
    },

    // ===== مرجوعی =====
    {
      id: "q-ret-1",
      category: "return",
      question: "شرایط بازگشت کالا چیست؟",
      answer: `
                <p>طبق قوانین فروشگاه، کالا در شرایط زیر قابل بازگشت است:</p>
                <ul>
                    <li>حداکثر <strong>۷ روز</strong> پس از تحویل</li>
                    <li>کالا در بسته‌بندی اصلی و بدون آسیب باشد</li>
                    <li>تمام متعلقات و لوازم همراه کالا موجود باشد</li>
                    <li>پلمب کالا باز نشده باشد (برای برخی محصولات)</li>
                </ul>
                <p>برای جزئیات بیشتر <a href="refund.html">رویه بازگشت کالا</a> را مطالعه کنید.</p>
            `,
    },
    {
      id: "q-ret-2",
      category: "return",
      question: "چه کالاهایی قابل بازگشت نیستند؟",
      answer: `
                <p>کالاهای زیر به دلیل رعایت بهداشت، قابل بازگشت نیستند:</p>
                <ul>
                    <li>هدفون و هندزفری (در صورت باز شدن بسته‌بندی)</li>
                    <li>محصولات بهداشتی و مراقبت شخصی</li>
                    <li>نرم‌افزارها و اشتراک‌های دیجیتال</li>
                    <li>کالاهایی که توسط مشتری آسیب دیده‌اند</li>
                </ul>
            `,
    },
    {
      id: "q-ret-3",
      category: "return",
      question: "پول من چه زمانی برگردانده می‌شود؟",
      answer: `
                <p>پس از دریافت کالا و تأیید سالم بودن آن توسط کارشناسان:</p>
                <ul>
                    <li>مبلغ حداکثر تا <strong>۷۲ ساعت کاری</strong> به حساب شما واریز می‌شود.</li>
                    <li>در صورت پرداخت آنلاین، مبلغ به همان کارت بازگردانده می‌شود.</li>
                    <li>در صورت کارت به کارت، مبلغ به شماره کارت اعلامی شما واریز می‌گردد.</li>
                </ul>
            `,
    },

    // ===== حساب کاربری =====
    {
      id: "q-acc-1",
      category: "account",
      question: "چگونه حساب کاربری بسازم؟",
      answer: `
                <p>برای ساخت حساب کاربری به صفحه <a href="auth.html">ورود / ثبت‌نام</a> بروید، روی تب «ثبت‌نام» کلیک کنید و اطلاعات زیر را وارد کنید:</p>
                <ul>
                    <li>نام و نام خانوادگی</li>
                    <li>ایمیل معتبر</li>
                    <li>شماره موبایل</li>
                    <li>رمز عبور (حداقل ۶ کاراکتر)</li>
                </ul>
                <p>پس از تأیید، حساب شما فعال می‌شود و می‌توانید خرید کنید.</p>
            `,
    },
    {
      id: "q-acc-2",
      category: "account",
      question: "رمز عبورم را فراموش کرده‌ام، چه کنم؟",
      answer: `
                <p>در حال حاضر امکان بازیابی خودکار رمز وجود ندارد. لطفاً برای بازیابی رمز:</p>
                <ol>
                    <li>با پشتیبانی تماس بگیرید: <strong style="direction:ltr;display:inline-block;">09229480252</strong></li>
                    <li>اطلاعات هویتی خود را تأیید کنید</li>
                    <li>رمز موقت برای شما ارسال می‌شود</li>
                    <li>پس از ورود، رمز خود را تغییر دهید</li>
                </ol>
                <p>این قابلیت به‌زودی به صورت خودکار از طریق پیامک فعال خواهد شد.</p>
            `,
    },
    {
      id: "q-acc-3",
      category: "account",
      question: "چگونه اطلاعات حسابم را ویرایش کنم؟",
      answer: `
                <p>پس از ورود به حساب کاربری:</p>
                <ol>
                    <li>به <a href="account.html">پنل کاربری</a> بروید</li>
                    <li>از منوی کنار، روی «اطلاعات حساب» کلیک کنید</li>
                    <li>نام، نام خانوادگی یا شماره موبایل را ویرایش کنید</li>
                    <li>روی «ذخیره تغییرات» کلیک کنید</li>
                </ol>
                <p><strong>توجه:</strong> ایمیل قابل ویرایش نیست. برای تغییر ایمیل با پشتیبانی تماس بگیرید.</p>
            `,
    },

    // ===== محصولات =====
    {
      id: "q-prod-1",
      category: "product",
      question: "قیمت‌های سایت به‌روز هستند؟",
      answer: `
                <p>بله، قیمت‌های سایت به‌صورت روزانه و لحظه‌ای به‌روزرسانی می‌شوند.</p>
                <p>با این حال، به دلیل نوسانات بازار، ممکن است برخی قیمت‌ها در روزهای خاص تغییر کنند. قیمت نهایی هنگام ثبت سفارش، قیمت معتبر است.</p>
            `,
    },
    {
      id: "q-prod-2",
      category: "product",
      question: "آیا محصولات اصل هستند؟",
      answer: `
                <p>بله، تمام محصولات فروشگاه موبایلی بلوچستان <strong>۱۰۰٪ اورجینال</strong> هستند و مستقیماً از شرکت‌های معتبر یا نمایندگی‌های رسمی تأمین می‌شوند.</p>
                <p>هر محصول با <strong>فاکتور رسمی</strong> و <strong>کارت گارانتی</strong> به دست شما می‌رسد.</p>
            `,
    },
    {
      id: "q-prod-3",
      category: "product",
      question: "امکان مقایسه محصولات وجود دارد؟",
      answer: `
                <p>بله، در صفحه محصولات، می‌توانید چند محصول را انتخاب کرده و <strong>مشخصات فنی آن‌ها را کنار هم مقایسه کنید</strong>.</p>
                <p>این امکان به شما کمک می‌کند تا با آگاهی کامل از تفاوت‌ها، بهترین انتخاب را داشته باشید.</p>
            `,
    },
    {
      id: "q-prod-4",
      category: "product",
      question: "چطور بفهمم محصولی موجود است یا خیر؟",
      answer: `
                <p>در صفحه هر محصول، وضعیت موجودی نمایش داده می‌شود:</p>
                <ul>
                    <li><strong style="color:#10b981;">موجود در انبار</strong> — قابل خریداری</li>
                    <li><strong style="color:#f59e0b;">فقط N عدد باقی‌مانده</strong> — سریع خرید کنید</li>
                    <li><strong style="color:#ef4444;">ناموجود</strong> — فعلاً قابل خرید نیست</li>
                </ul>
                <p>محصولات ناموجود را می‌توانید به لیست علاقه‌مندی اضافه کنید تا در زمان موجود شدن مطلع شوید.</p>
            `,
    },
  ],

  // ========== راه‌اندازی ==========
  init() {
    this.renderCategories();
    this.renderQuestions();
    this.attachEvents();
  },

  // ========== رندر دسته‌بندی‌ها ==========
  renderCategories() {
    const container = document.getElementById("faqCategories");
    if (!container) return;

    const counts = { all: this.questions.length };
    this.categories.forEach((c) => {
      if (c.id !== "all") {
        counts[c.id] = this.questions.filter((q) => q.category === c.id).length;
      }
    });

    container.innerHTML = this.categories
      .map((c) => {
        const count = counts[c.id] || 0;
        if (count === 0) return "";
        return `
                <button type="button"
                        class="faq-cat-btn ${c.id === this.state.activeCategory ? "active" : ""}"
                        data-cat="${c.id}"
                        onclick="FAQPage.selectCategory('${c.id}')">
                    <i class="bi ${c.icon}"></i>
                    <span class="cat-label-full">${c.label}</span>
                    <span class="cat-label-short">${c.shortLabel}</span>
                </button>
            `;
      })
      .join("");
  },

  selectCategory(catId) {
    this.state.activeCategory = catId;
    this.state.openItemId = null;
    document.querySelectorAll(".faq-cat-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cat === catId);
    });
    this.renderQuestions();
  },

  // ========== رندر سوالات ==========
  renderQuestions() {
    const container = document.getElementById("faqList");
    if (!container) return;

    let list = [...this.questions];

    // فیلتر دسته
    if (this.state.activeCategory !== "all") {
      list = list.filter((q) => q.category === this.state.activeCategory);
    }

    // فیلتر جستجو
    if (this.state.searchTerm) {
      const term = this.state.searchTerm.toLowerCase();
      list = list.filter(
        (q) =>
          q.question.toLowerCase().includes(term) ||
          this.stripHTML(q.answer).toLowerCase().includes(term),
      );
    }

    if (list.length === 0) {
      container.innerHTML = this.renderEmpty();
      return;
    }

    container.innerHTML = list.map((q) => this.renderItem(q)).join("");
  },

  renderItem(q) {
    const isOpen = this.state.openItemId === q.id;
    return `
            <div class="faq-item ${isOpen ? "active" : ""}" data-id="${q.id}">
                <button type="button"
                        class="faq-question"
                        aria-expanded="${isOpen}"
                        aria-controls="answer-${q.id}"
                        onclick="FAQPage.toggleItem('${q.id}')">
                    <span class="faq-question-text">
                        <span class="q-icon">؟</span>
                        <span>${this.escape(q.question)}</span>
                    </span>
                    <span class="faq-toggle-icon">
                        <i class="bi bi-chevron-down"></i>
                    </span>
                </button>
                <div class="faq-answer" id="answer-${q.id}">
                    <div class="faq-answer-inner">
                        ${q.answer}
                    </div>
                </div>
            </div>
        `;
  },

  renderEmpty() {
    const isSearch = this.state.searchTerm;
    return `
            <div class="faq-empty">
                <div class="faq-empty-icon">
                    <i class="bi bi-${isSearch ? "search" : "question-circle"}"></i>
                </div>
                <h4>${isSearch ? "سوالی با این عنوان یافت نشد" : "سوالی در این دسته وجود ندارد"}</h4>
                <p>
                    ${
                      isSearch
                        ? "لطفاً کلمات دیگری را امتحان کنید یا سوال خود را مستقیماً از پشتیبانی بپرسید."
                        : "به‌زودی سوالات این دسته اضافه می‌شوند."
                    }
                </p>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${
                      isSearch
                        ? `
                        <button type="button" class="btn-faq-primary" onclick="FAQPage.clearSearch()">
                            <i class="bi bi-x-circle"></i>
                            پاک کردن جستجو
                        </button>
                    `
                        : ""
                    }
                    <a href="contact.html" class="btn-faq-outline btn-faq-contact">
                        <i class="bi bi-headset"></i>
                        پرسیدن از پشتیبانی
                    </a>
                </div>
            </div>
        `;
  },

  // ========== تاگل آیتم ==========
  toggleItem(id) {
    const item = document.querySelector(`.faq-item[data-id="${id}"]`);
    if (!item) return;

    const isOpen = this.state.openItemId === id;

    // بستن همه
    document
      .querySelectorAll(".faq-item")
      .forEach((el) => el.classList.remove("active"));
    document
      .querySelectorAll(".faq-question")
      .forEach((btn) => btn.setAttribute("aria-expanded", "false"));

    if (!isOpen) {
      item.classList.add("active");
      item.querySelector(".faq-question").setAttribute("aria-expanded", "true");
      this.state.openItemId = id;
    } else {
      this.state.openItemId = null;
    }
  },

  // ========== رویدادها ==========
  attachEvents() {
    // جستجو
    const searchInput = document.getElementById("faqSearch");
    const clearBtn = document.getElementById("faqClearSearch");

    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.state.searchTerm = e.target.value.trim();
          this.state.openItemId = null;
          if (clearBtn)
            clearBtn.classList.toggle("show", !!this.state.searchTerm);
          this.renderQuestions();
        }, 200);
      });

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Escape") this.clearSearch();
      });
    }

    // دکمه پاک کردن
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearSearch());
    }

    // دکمه اسکرول بالا
    const scrollBtn = document.getElementById("scrollTopBtn");
    if (scrollBtn) {
      window.addEventListener(
        "scroll",
        () => {
          scrollBtn.classList.toggle("show", window.scrollY > 400);
        },
        { passive: true },
      );

      scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // پشتیبانی از URL hash
    this.handleHash();
    window.addEventListener("hashchange", () => this.handleHash());
  },

  handleHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    // مثلاً #q-ship-1
    const item = this.questions.find((q) => q.id === hash);
    if (item) {
      // اگه دسته فرق می‌کنه، عوضش کن
      if (
        this.state.activeCategory !== "all" &&
        this.state.activeCategory !== item.category
      ) {
        this.selectCategory("all");
      }
      // بعد از رندر، اسکرول
      setTimeout(() => {
        const el = document.querySelector(`.faq-item[data-id="${hash}"]`);
        if (el) {
          this.toggleItem(hash);
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
    }
  },

  clearSearch() {
    this.state.searchTerm = "";
    const searchInput = document.getElementById("faqSearch");
    const clearBtn = document.getElementById("faqClearSearch");
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.classList.remove("show");
    this.state.openItemId = null;
    this.renderQuestions();
  },

  // ========== ابزارها ==========
  escape(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  stripHTML(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  },
};

window.FAQPage = FAQPage;

document.addEventListener("DOMContentLoaded", () => {
  FAQPage.init();
});
