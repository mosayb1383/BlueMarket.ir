// ========== سیستم مدیریت مودال خروج یکپارچه ==========

function createLogoutModal() {
  let existingModal = document.getElementById("globalLogoutModal");
  if (existingModal) return existingModal;

  const modalDiv = document.createElement("div");
  modalDiv.className = "modal fade";
  modalDiv.id = "globalLogoutModal";
  modalDiv.setAttribute("tabindex", "-1");
  modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="bi bi-box-arrow-right me-2 text-danger"></i>خروج از حساب کاربری</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>با خروج از حساب کاربری، به سبد خرید و لیست علاقه‌مندی‌هایتان دسترسی نخواهید داشت.</p>
                    <p class="text-muted small">آیا مطمئن هستید که می‌خواهید خارج شوید؟</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">انصراف</button>
                    <button type="button" class="btn btn-danger" id="globalConfirmLogoutBtn">خروج از حساب</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modalDiv);
  return modalDiv;
}

function showLogoutModal() {
  const modal = createLogoutModal();
  const confirmBtn = document.getElementById("globalConfirmLogoutBtn");

  if (confirmBtn) {
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener("click", function () {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) modalInstance.hide();
      if (typeof logoutUser === "function") {
        logoutUser();
      } else {
        localStorage.removeItem("blUser");
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
      }
    });
  }

  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

function confirmLogout() {
  showLogoutModal();
}

function removeDuplicateModals() {
  const allModals = document.querySelectorAll(".modal");
  let logoutModals = [];

  allModals.forEach((modal) => {
    const title = modal.querySelector(".modal-title");
    if (title && title.textContent.includes("خروج")) {
      logoutModals.push(modal);
    }
    if (modal.id === "logoutModal") {
      logoutModals.push(modal);
    }
  });

  if (logoutModals.length > 1) {
    for (let i = 1; i < logoutModals.length; i++) {
      if (logoutModals[i] && logoutModals[i].remove) {
        logoutModals[i].remove();
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  removeDuplicateModals();
});
