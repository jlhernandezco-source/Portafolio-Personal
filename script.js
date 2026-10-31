"use strict";

const botonMenu = document.querySelector(".menu-toggle");
const navegacion = document.querySelector(".navegacion");
const enlacesMenu = [...document.querySelectorAll(".menu a")];
const secciones = [...document.querySelectorAll("main section[id]")];
const elementosRevelar = document.querySelectorAll(
  ".seccion, .experiencia, .tarjeta-proyecto, .tarjeta-formacion"
);
const anio = document.getElementById("anio");
const consultaMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("con-js");

if (anio) {
  anio.textContent = String(new Date().getFullYear());
}

function cambiarMenu(abierto) {
  botonMenu.setAttribute("aria-expanded", String(abierto));
  botonMenu.setAttribute(
    "aria-label",
    abierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"
  );
  navegacion.classList.toggle("navegacion--abierta", abierto);
}

botonMenu.addEventListener("click", () => {
  cambiarMenu(botonMenu.getAttribute("aria-expanded") !== "true");
});

enlacesMenu.forEach((enlace) => {
  enlace.addEventListener("click", () => {
    window.setTimeout(() => cambiarMenu(false), 0);
  });
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && botonMenu.getAttribute("aria-expanded") === "true") {
    cambiarMenu(false);
    botonMenu.focus();
  }
});

const observadorRevelado = "IntersectionObserver" in window
  ? new IntersectionObserver((entradas, observador) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" })
  : null;

elementosRevelar.forEach((elemento) => {
  if (consultaMovimientoReducido.matches || !observadorRevelado) {
    elemento.classList.add("visible");
    return;
  }

  elemento.classList.add("revelar");
  observadorRevelado.observe(elemento);
});

function actualizarNavegacionActiva() {
  if (!secciones.length) {
    return;
  }

  const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  const lineaActiva = window.innerHeight * 0.35;
  const seccionActiva = alFinal
    ? secciones.at(-1)
    : [...secciones].reverse().find((seccion) => seccion.getBoundingClientRect().top <= lineaActiva)
      || secciones[0];

  enlacesMenu.forEach((enlace) => {
    const activo = enlace.getAttribute("href") === `#${seccionActiva.id}`;

    if (activo) {
      enlace.setAttribute("aria-current", "location");
    } else {
      enlace.removeAttribute("aria-current");
    }
  });
}

let actualizacionPendiente = false;
function solicitarActualizacionNavegacion() {
  if (actualizacionPendiente) {
    return;
  }

  actualizacionPendiente = true;
  requestAnimationFrame(() => {
    actualizarNavegacionActiva();
    actualizacionPendiente = false;
  });
}

window.addEventListener("scroll", solicitarActualizacionNavegacion, { passive: true });
window.addEventListener("resize", solicitarActualizacionNavegacion);
actualizarNavegacionActiva();

const contadores = document.querySelectorAll("[data-contador]");

function animarContador(elemento) {
  const destino = Number(elemento.dataset.contador);

  if (!Number.isFinite(destino) || destino < 0) {
    return;
  }

  if (consultaMovimientoReducido.matches) {
    elemento.textContent = String(destino);
    return;
  }

  const duracion = Number(elemento.dataset.duracion) || 1000;
  const inicio = performance.now();

  function avanzar(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - (1 - progreso) ** 3;
    elemento.textContent = String(Math.round(destino * suavizado));

    if (progreso < 1) {
      requestAnimationFrame(avanzar);
    }
  }

  requestAnimationFrame(avanzar);
}

if ("IntersectionObserver" in window && contadores.length) {
  const observadorContadores = new IntersectionObserver((entradas, observador) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.5 });

  contadores.forEach((contador) => observadorContadores.observe(contador));
} else {
  contadores.forEach(animarContador);
}

window.matchMedia("(min-width: 64rem)").addEventListener("change", (evento) => {
  if (evento.matches) {
    cambiarMenu(false);
  }
});
