
document.addEventListener("click", e => {
  const btn = e.target.closest("button.btn-f1, button.btn-f1-solid, button.btn-f1-dark, button.btn-hero");
  if (!btn) return;
  btn.classList.remove("btn-pop");
  void btn.offsetWidth;
  btn.classList.add("btn-pop");
});