(function () {
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".menu");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScroll() {
    if (nav) nav.classList.toggle("is-solid", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  var layers = document.querySelectorAll("[data-parallax]");
  function parallax() {
    layers.forEach(function (el) {
      var speed = Number(el.getAttribute("data-speed")) || 0.08;
      var parent = el.parentElement;
      var box = parent.getBoundingClientRect();
      if (el.classList.contains("hero-media") || el.classList.contains("vista-media")) {
        var passed = Math.max(0, -box.top);
        var shift = Math.min(passed * speed, parent.offsetHeight * 0.2);
        el.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
        return;
      }
      var drift = box.top * speed * -0.45;
      el.style.transform = "translate3d(0," + drift.toFixed(2) + "px,0)";
    });
  }
  if (!reduce && layers.length) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        parallax();
        ticking = false;
      });
    }, { passive: true });
    parallax();
  }

  var dialog = document.querySelector(".light");
  if (dialog) {
    var shot = dialog.querySelector("img");
    document.querySelectorAll("[data-zoom]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        shot.src = btn.getAttribute("data-zoom");
        shot.alt = btn.getAttribute("data-alt") || "Planta do Absoluto Residence";
        if (typeof dialog.showModal === "function") dialog.showModal();
      });
    });
    var close = dialog.querySelector("[data-close]");
    if (close) close.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  document.querySelectorAll("[data-interest]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var select = document.querySelector("[name=interesse]");
      if (select) select.value = btn.getAttribute("data-interest");
    });
  });

  var tabela = document.getElementById("tabela-vendas");
  var data = window.ABSOLUTO;
  if (tabela && data) {
    var money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    var area = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    function rows(list, cells) {
      return list.map(function (item) {
        return "<tr>" + cells(item).map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>";
      }).join("");
    }
    tabela.innerHTML =
      '<div class="table-scroll"><table class="sales"><thead><tr><th>Unidade</th><th>m²</th><th>Tipo</th><th>Dorm.</th><th>Box</th><th>Valor</th></tr></thead><tbody>' +
      rows(data.units, function (item) {
        return [item.id, area.format(item.area), item.tipo, String(item.dorms), item.box, money.format(item.price)];
      }) +
      '</tbody></table></div><h3 class="sales-title">Box para motos</h3><div class="table-scroll"><table class="sales"><thead><tr><th>Unidade</th><th>m²</th><th>Valor</th></tr></thead><tbody>' +
      rows(data.boxes, function (item) {
        return [item.id, area.format(item.area), money.format(item.price)];
      }) +
      '</tbody></table></div><p class="table-note">' + data.note + " " + data.address + ", " + data.city + "/" + data.state + ".</p>";
  }

  document.querySelectorAll("form.lead").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = String(value).trim(); });
      if (!data.nome || !data.telefone) return;
      data.at = new Date().toISOString();
      data.page = document.body.getAttribute("data-page") || "inicio";
      var store = "absoluto-interesse";
      var all = [];
      try { all = JSON.parse(localStorage.getItem(store) || "[]"); } catch (error) { all = []; }
      if (!Array.isArray(all)) all = [];
      all.push(data);
      localStorage.setItem(store, JSON.stringify(all));
      form.hidden = true;
      var thanks = form.parentElement.querySelector(".thanks");
      if (thanks) thanks.hidden = false;
    });
  });
})();
