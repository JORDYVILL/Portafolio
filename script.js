// Portafolio: lee data.json y construye la página (solo frontend)
fetch("data.json")
  .then((r) => r.json())
  .then((data) => {

    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tags = (a) => `<div class="tags">${a.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`;

    const paginas = [
      { id: "inicio", t: "Inicio" }, { id: "sobre-mi", t: "Sobre mí" }, { id: "proyectos", t: "Proyectos" },
      { id: "versionamiento", t: "Git" }, { id: "habilidades", t: "Habilidades" }, { id: "contacto", t: "Contacto" }
    ];
    $("menu").innerHTML = paginas.map((p) => `<li><a href="#${p.id}" data-link="${p.id}">${p.t}</a></li>`).join("");

    // Inicio
    $("nombre").textContent = data.perfil.nombre;
    $("titulo").textContent = data.perfil.titulo;
    $("bio").textContent = data.perfil.bio;
    $("pie-nombre").textContent = data.perfil.nombre;
    $("anio").textContent = new Date().getFullYear();
    $("tipeo").textContent = data.frases[0];
    $("explorar").innerHTML = [
      { id: "proyectos", t: "Proyectos", d: "Apps y sistemas que he construido." },
      { id: "versionamiento", t: "Versionamiento", d: "Cómo organizo y respaldo mi código." },
      { id: "contacto", t: "Contacto", d: "Hablemos de tu proyecto." }
    ].map((g) => `<a class="card tilt" href="#${g.id}"><strong>${g.t}</strong><span>${esc(g.d)}</span><em>abrir →</em></a>`).join("");

    // Sobre mí
    $("perfil-nombre").textContent = data.perfil.nombre;
    $("perfil-rol").textContent = data.perfil.titulo;
    $("sobre-mi-texto").innerHTML = data.perfil.sobre_mi.map((p) =>
      `<article class="card tilt mini"><h3>${esc(p.t)}</h3><p>${esc(p.x)}</p></article>`).join("");
    $("educacion-lista").innerHTML = data.educacion.map((e) => `
      <article class="card tilt edu">
        <span class="badge">Educación</span>
        <h3>${esc(e.titulo)}</h3>
        <p class="uni">${esc(e.lugar)}</p>
        <p class="mat-t">Materias que cursa</p>
        ${tags(e.materias)}
      </article>`).join("");

    // Proyectos con filtro
    const tipos = ["Todos", ...new Set(data.proyectos.map((p) => p.tipo))];
    $("filtros").innerHTML = tipos.map((t, i) => `<button type="button" class="chip" data-f="${esc(t)}" aria-pressed="${i === 0}">${esc(t)}</button>`).join("");
    $("proyectos-lista").innerHTML = data.proyectos.map((p) => `
      <article class="card tilt" data-tipo="${esc(p.tipo)}">
        <span class="badge">${esc(p.tipo)}</span>
        <h3>${esc(p.nombre)}</h3>
        <p>${esc(p.descripcion)}</p>
        ${tags(p.tecnologias)}
        <ul>${p.funciones.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <div class="links"><a href="${esc(p.enlaces.github)}">GitHub ↗</a><a href="${esc(p.enlaces.demo)}">Demo ↗</a></div>
      </article>`).join("");
    $("filtros").addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      document.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b));
      document.querySelectorAll("#proyectos-lista .card").forEach((c) => { c.hidden = b.dataset.f !== "Todos" && c.dataset.tipo !== b.dataset.f; });
    });

    // Git interactivo
    $("pasos").innerHTML = data.pasos.map((p, i) => `<button type="button" class="step" data-i="${i}" aria-pressed="${i === 0}"><span>${i + 1}</span>${esc(p.titulo)}</button>`).join("");
    function pasoGit(i) {
      document.querySelectorAll(".step").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.i) === i));
      $("git-term").innerHTML = data.pasos.slice(0, i + 1).map((p, k) =>
        `<span class="${k === i ? "now" : "dim"}"><span class="pr">$</span> ${esc(p.cmd)}</span>`).join("\n") + `\n<span class="pr">$</span> <span class="cur"></span>`;
      $("git-nota").innerHTML = `<strong>${i + 1}. ${esc(data.pasos[i].titulo)}</strong>${esc(data.pasos[i].nota)}`;
    }
    $("pasos").addEventListener("click", (e) => { const b = e.target.closest(".step"); if (b) pasoGit(Number(b.dataset.i)); });
    pasoGit(0);

    // Habilidades
    $("habilidades-lista").innerHTML = Object.entries(data.habilidades).map(([cat, items]) =>
      `<article class="card tilt"><h3>${esc(cat)}</h3>${tags(items)}</article>`).join("");

    // Contacto
    $("correo").textContent = data.contacto.correo;
    $("contacto-links").innerHTML = ["github", "linkedin", "whatsapp"].map((k) =>
      `<a class="btn ghost" href="${esc(data.contacto[k])}" target="_blank" rel="noopener">${k === "github" ? "GitHub" : k === "linkedin" ? "LinkedIn" : "WhatsApp"} ↗</a>`).join("");
    $("copiar").addEventListener("click", (e) => {
      const b = e.currentTarget;
      const ok = () => { b.textContent = "Copiado ✓"; setTimeout(() => (b.textContent = "Copiar correo"), 1600); };
      const fail = () => { b.textContent = "Selecciona el correo"; setTimeout(() => (b.textContent = "Copiar correo"), 2200); };
      try { navigator.clipboard.writeText(data.contacto.correo).then(ok, fail); } catch (_) { fail(); }
    });

    // Navegación por hash
    function mostrar() {
      const h = decodeURIComponent(location.hash.slice(1));
      const p = paginas.find((x) => x.id === h) || paginas[0];
      document.querySelectorAll(".view").forEach((v) => { v.hidden = v.dataset.view !== p.id; });
      document.querySelectorAll("[data-link]").forEach((a) => {
        if (a.dataset.link === p.id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", mostrar);
    mostrar();

    // Brillo que sigue al cursor
    if (!reducir) {
      window.addEventListener("pointermove", (e) => {
        const g = $("glow");
        g.style.setProperty("--mx", e.clientX + "px");
        g.style.setProperty("--my", e.clientY + "px");
      });
    }

    // Inclinación de tarjetas
    if (!reducir) {
      document.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const c = e.target.closest && e.target.closest(".tilt");
        if (!c) return;
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(800px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
      });
      document.addEventListener("pointerout", (e) => {
        const c = e.target.closest && e.target.closest(".tilt");
        if (c && !c.contains(e.relatedTarget)) c.style.transform = "";
      });
    }

    // Texto que se escribe solo
    if (!reducir) {
      let w = 0, ch = data.frases[0].length, borrar = true;
      const el = $("tipeo");
      (function tick() {
        const f = data.frases[w];
        if (borrar) { ch--; if (ch <= 0) { borrar = false; w = (w + 1) % data.frases.length; ch = 0; } }
        else { ch++; if (ch >= data.frases[w].length) { borrar = true; el.textContent = data.frases[w]; return setTimeout(tick, 1800); } }
        el.textContent = data.frases[w].slice(0, ch);
        setTimeout(tick, borrar ? 35 : 70);
      })();
    }
  })
  .catch(() => {
    document.querySelector(".view").innerHTML =
      "<h2>No se pudo cargar data.json</h2><p class='sub'>Abre la página desde GitHub Pages o con un servidor local (Live Server).</p>";
  });
