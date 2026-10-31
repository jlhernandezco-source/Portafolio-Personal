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
  enlace.addEventListener("click", () => cambiarMenu(false));
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

function actualizarNavegacionActiva(entradas) {
  const seccionActiva = entradas
    .filter((entrada) => entrada.isIntersecting)
    .sort((primera, segunda) => primera.boundingClientRect.top - segunda.boundingClientRect.top)[0];

  if (!seccionActiva) {
    return;
  }

  enlacesMenu.forEach((enlace) => {
    const activo = enlace.getAttribute("href") === `#${seccionActiva.target.id}`;

    if (activo) {
      enlace.setAttribute("aria-current", "location");
    } else {
      enlace.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const observadorSecciones = new IntersectionObserver(
    actualizarNavegacionActiva,
    { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
  );
  secciones.forEach((seccion) => observadorSecciones.observe(seccion));
} else {
  const actualizarAlDesplazar = () => {
    const lineaActiva = window.innerHeight * 0.35;
    const seccionActiva = secciones
      .map((seccion) => ({
        seccion,
        distancia: Math.abs(seccion.getBoundingClientRect().top - lineaActiva)
      }))
      .sort((primera, segunda) => primera.distancia - segunda.distancia)[0]?.seccion;

    if (!seccionActiva) {
      return;
    }

    enlacesMenu.forEach((enlace) => {
      if (enlace.getAttribute("href") === `#${seccionActiva.id}`) {
        enlace.setAttribute("aria-current", "location");
      } else {
        enlace.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener("scroll", actualizarAlDesplazar, { passive: true });
  actualizarAlDesplazar();
}

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
