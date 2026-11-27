// validaciones.js
// Validaciones de login y registro. La idea es ayudar a que la persona no se equivoque
// (guías, sugerencias, correcciones automáticas) y no solo avisarle cuando ya falló.
// Necesita avisos.js cargado antes.

// ---------- Funciones de apoyo ----------

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

// Celular colombiano: 10 dígitos y empieza por 3
function telefonoValido(telefono) {
  return /^3\d{9}$/.test(telefono);
}

// Las contraseñas no se recortan; lo demás sí
function leerValor(campo) {
  return campo.type === "password" ? campo.value : campo.value.trim();
}

// Primera letra de cada palabra en mayúscula: "valentina bucuru" -> "Valentina Bucuru"
function ponerMayusculas(texto) {
  return texto
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s-])\S/g, (letra) => letra.toUpperCase());
}

// ---------- Correo: sugerencias y errores de digitación ----------

const dominiosComunes = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];

const dominiosCorregidos = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "yaho.com": "yahoo.com"
};

function sugerirCorreo(correo) {
  const [usuario, dominio] = correo.toLowerCase().split("@");
  if (dominio && dominiosCorregidos[dominio]) {
    return usuario + "@" + dominiosCorregidos[dominio];
  }
  return "";
}

// Se usa en login y en registro, por eso va aparte
function revisarCorreo(valor) {
  if (!valor) return "Escriba su correo para poder continuar.";
  if (!correoValido(valor)) return "Ese correo parece incompleto. Debe verse así: nombre@correo.com";

  const sugerido = sugerirCorreo(valor);
  if (sugerido) return "¿Quiso decir " + sugerido + "?";

  return "";
}

// Botoncitos con los dominios más usados, para no tener que escribirlos completos
function actualizarSugerenciasCorreo(campo) {
  const contenedor = campo.closest(".campo") || campo.parentElement;
  let caja = contenedor.querySelector(".sugerencias");

  const valor = campo.value.trim().toLowerCase();
  const posicion = valor.indexOf("@");
  const usuario = posicion > 0 ? valor.slice(0, posicion) : "";
  const escrito = posicion > 0 ? valor.slice(posicion + 1) : "";

  const opciones = usuario
    ? dominiosComunes.filter((dominio) => dominio.startsWith(escrito) && dominio !== escrito)
    : [];

  if (opciones.length === 0) {
    if (caja) caja.remove();
    return;
  }

  if (!caja) {
    caja = document.createElement("div");
    caja.className = "sugerencias";
    caja.setAttribute("aria-label", "Sugerencias de correo");
    contenedor.appendChild(caja);
  }

  caja.innerHTML = "";
  opciones.forEach((dominio) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "sugerencia";
    boton.textContent = "@" + dominio;

    // mousedown evita que el campo pierda el foco antes de tocar el botón
    boton.addEventListener("mousedown", (e) => e.preventDefault());
    boton.addEventListener("click", () => {
      campo.value = usuario + "@" + dominio;
      campo.dispatchEvent(new Event("input", { bubbles: true }));
      validarCampo(campo.id);
      caja.remove();
    });

    caja.appendChild(boton);
  });
}

function quitarSugerenciasCorreo(campo) {
  const contenedor = campo.closest(".campo") || campo.parentElement;
  const caja = contenedor.querySelector(".sugerencias");
  if (caja) caja.remove();
}

// ---------- Textos de guía (se ven desde el principio) ----------
// La contraseña no lleva guía porque ya tiene su lista de requisitos

const guias = {
  "login-correo": "Use el correo con el que se registró.",
  "reg-nombre": "Así lo vamos a llamar.",
  "reg-correo": "Lo usará para iniciar sesión.",
  "reg-telefono": "Solo números, por ejemplo 3001234567.",
  "reg-equipo": "Elija el equipo al que le va.",
  "reg-confirmar": "Escríbala otra vez para estar seguros."
};

// ---------- Requisitos de la contraseña ----------
// Son los mismos tres que se ven en la lista de registro.html

const requisitosClave = {
  longitud: (clave) => clave.length >= 8,
  mayuscula: (clave) => /\p{Lu}/u.test(clave),
  especial: (clave) => /[^\p{L}\p{N}\s]/u.test(clave)
};

// Marca en verde cada requisito que ya se cumple
function actualizarRequisitos(campo) {
  document.querySelectorAll("#password-requisitos .req-item").forEach((item) => {
    const revisar = requisitosClave[item.dataset.requisito];
    if (!revisar) return;

    const cumple = revisar(campo.value);
    item.classList.toggle("cumplido", cumple);

    // Para quien usa lector de pantalla: el color solo no alcanza
    let estado = item.querySelector(".visually-hidden");
    if (!estado) {
      estado = document.createElement("span");
      estado.className = "visually-hidden";
      item.appendChild(estado);
    }
    estado.textContent = cumple ? " (cumplido)" : " (pendiente)";
  });
}

// ---------- Reglas de cada campo ----------
// Cada regla devuelve un texto de error, o "" si el campo está bien

const reglas = {
  "login-correo": (valor) => revisarCorreo(valor),

  "login-password": (valor) => {
    if (!valor) return "Escriba su contraseña para entrar.";
    return "";
  },

  "reg-nombre": (valor) => {
    if (!valor) return "Cuéntenos cómo se llama.";
    if (valor.length < 3) return "Escriba al menos 3 letras.";
    return "";
  },

  "reg-correo": (valor) => revisarCorreo(valor),

  "reg-telefono": (valor) => {
    if (!valor) return "Escriba su número de celular.";
    if (!telefonoValido(valor)) return "Deben ser 10 números y empezar por 3.";
    return "";
  },

  "reg-equipo": (valor) => {
    if (!valor) return "Elija su equipo favorito.";
    return "";
  },

  "reg-password": (valor) => {
    if (!valor) return "Cree una contraseña.";
    if (!requisitosClave.longitud(valor)) return "Le faltan caracteres: use mínimo 8.";
    if (!requisitosClave.mayuscula(valor)) return "Agregue al menos una letra mayúscula.";
    if (!requisitosClave.especial(valor)) return "Agregue un carácter especial, como ! @ # $";
    return "";
  },

  "reg-confirmar": (valor) => {
    const password = document.getElementById("reg-password");
    if (!valor) return "Escriba otra vez su contraseña.";
    if (password && valor !== password.value) return "Las contraseñas aún no coinciden.";
    return "";
  }
};

// Mensajes cortos cuando el campo queda bien
const mensajesOk = {
  "reg-nombre": "¡Mucho gusto!",
  "reg-correo": "Correo listo",
  "reg-telefono": "Número listo",
  "reg-password": "Contraseña lista",
  "reg-confirmar": "Perfecto, coinciden"
};

// Lo que se le sugiere hacer en el siguiente paso
const pasos = {
  "reg-nombre": "Siguiente: cuéntenos su nombre",
  "reg-correo": "Siguiente: escriba su correo",
  "reg-telefono": "Siguiente: escriba su celular",
  "reg-equipo": "Siguiente: elija su equipo favorito",
  "reg-password": "Siguiente: cree su contraseña",
  "reg-confirmar": "Siguiente: repita su contraseña"
};

// ---------- Validar un campo ----------

// Valida y muestra el resultado debajo del campo
function validarCampo(id) {
  const campo = document.getElementById(id);
  if (!campo || !reglas[id]) return true;

  const error = reglas[id](leerValor(campo));

  if (error) {
    mostrarErrorCampo(id, error);
    return false;
  }

  mostrarOkCampo(id, mensajesOk[id] || "");
  return true;
}

// Solo revisa, sin mostrar nada (sirve para el progreso)
function campoEsValido(id) {
  const campo = document.getElementById(id);
  if (!campo || !reglas[id]) return true;

  return reglas[id](leerValor(campo)) === "";
}

function idsDelFormulario(formulario) {
  return Array.from(formulario.querySelectorAll("input, select"))
    .map((campo) => campo.id)
    .filter((id) => reglas[id]);
}

// ---------- Guía de avance (solo en formularios largos) ----------

function crearProgreso(formulario) {
  const total = idsDelFormulario(formulario).length;
  if (total < 4) return;

  const progreso = document.createElement("div");
  progreso.className = "progreso";

  const texto = document.createElement("p");
  texto.className = "progreso-texto";

  const pista = document.createElement("div");
  pista.className = "progreso-pista";
  pista.setAttribute("role", "progressbar");
  pista.setAttribute("aria-label", "Avance del formulario");
  pista.setAttribute("aria-valuemin", "0");
  pista.setAttribute("aria-valuemax", String(total));

  const relleno = document.createElement("span");
  relleno.className = "progreso-relleno";
  pista.appendChild(relleno);

  // Botón que lleva directo al siguiente dato pendiente
  const siguiente = document.createElement("button");
  siguiente.type = "button";
  siguiente.className = "progreso-siguiente";
  siguiente.addEventListener("click", () => {
    if (siguiente.dataset.campo) irAlCampo(document.getElementById(siguiente.dataset.campo));
  });

  progreso.append(texto, pista, siguiente);
  formulario.prepend(progreso);

  actualizarProgreso(formulario);
}

function actualizarProgreso(formulario) {
  const progreso = formulario.querySelector(".progreso");
  if (!progreso) return;

  const ids = idsDelFormulario(formulario);
  const pendientes = ids.filter((id) => !campoEsValido(id));
  const listos = ids.length - pendientes.length;

  const texto = progreso.querySelector(".progreso-texto");
  const siguiente = progreso.querySelector(".progreso-siguiente");

  texto.textContent = listos === 0
    ? "Son solo " + ids.length + " datos, lo vamos guiando."
    : "Va " + listos + " de " + ids.length;

  if (pendientes.length > 0) {
    const proximo = document.getElementById(pendientes[0]);
    siguiente.dataset.campo = pendientes[0];
    siguiente.textContent = pasos[pendientes[0]] || "Siguiente: " + nombreDelCampo(proximo).toLowerCase();
    siguiente.disabled = false;
  } else {
    siguiente.dataset.campo = "";
    siguiente.textContent = "¡Todo listo! Ya puede crear su cuenta.";
    siguiente.disabled = true;
  }

  const relleno = progreso.querySelector(".progreso-relleno");
  relleno.style.width = (listos / ids.length) * 100 + "%";
  progreso.querySelector(".progreso-pista").setAttribute("aria-valuenow", String(listos));
  progreso.classList.toggle("completo", pendientes.length === 0);
}

// ---------- Medidor de seguridad de la contraseña ----------

const textosFuerza = ["", "Muy sencilla", "Puede mejorar", "Buena", "¡Muy segura!"];

function calcularFuerza(clave) {
  if (!clave) return 0;

  let puntos = 0;
  if (clave.length >= 8) puntos++;
  if (clave.length >= 12) puntos++;
  if (/[a-z]/.test(clave) && /[A-Z]/.test(clave)) puntos++;
  if (/\d/.test(clave)) puntos++;
  if (/[^A-Za-z0-9]/.test(clave)) puntos++;

  return Math.min(puntos, 4);
}

function crearMedidorFuerza() {
  const campo = document.getElementById("reg-password");
  if (!campo) return;

  const medidor = document.createElement("div");
  medidor.className = "fuerza";
  medidor.hidden = true;
  medidor.innerHTML = '<span></span><span></span><span></span><span></span><em class="fuerza-texto"></em>';

  obtenerMensajeCampo(campo).before(medidor);
}

function actualizarFuerza(campo) {
  const medidor = (campo.closest(".campo") || campo.parentElement).querySelector(".fuerza");
  if (!medidor) return;

  const nivel = calcularFuerza(campo.value);
  medidor.hidden = nivel === 0;
  medidor.dataset.nivel = nivel;
  medidor.querySelector(".fuerza-texto").textContent = textosFuerza[nivel];
}

// ---------- Resumen de errores al enviar ----------

function nombreDelCampo(campo) {
  const etiqueta = document.querySelector('label[for="' + campo.id + '"]');
  if (etiqueta) return etiqueta.textContent.replace("*", "").trim();

  return campo.placeholder || campo.id;
}

function quitarResumen(formulario) {
  const resumen = formulario.querySelector(".resumen");
  if (resumen) resumen.remove();
}

function mostrarResumen(formulario, camposConError) {
  quitarResumen(formulario);

  const resumen = document.createElement("div");
  resumen.className = "resumen";
  resumen.setAttribute("role", "alert");

  const titulo = document.createElement("p");
  titulo.className = "resumen-titulo";
  titulo.textContent = camposConError.length === 1
    ? "Casi lo logra, solo falta revisar 1 dato:"
    : "Casi lo logra, faltan " + camposConError.length + " datos por revisar:";

  const lista = document.createElement("ul");
  lista.className = "resumen-lista";

  camposConError.forEach((campo) => {
    const item = document.createElement("li");
    item.dataset.campo = campo.id;

    const enlace = document.createElement("button");
    enlace.type = "button";
    enlace.className = "resumen-enlace";
    enlace.textContent = nombreDelCampo(campo);
    enlace.addEventListener("click", () => irAlCampo(campo));

    item.appendChild(enlace);
    lista.appendChild(item);
  });

  resumen.append(titulo, lista);
  formulario.prepend(resumen);
}

// Marca como resueltos los datos que ya se corrigieron
function actualizarResumen(formulario) {
  const resumen = formulario.querySelector(".resumen");
  if (!resumen) return;

  const pendientes = idsDelFormulario(formulario).filter((id) => !campoEsValido(id));
  if (pendientes.length === 0) {
    resumen.remove();
    return;
  }

  resumen.querySelectorAll("li").forEach((item) => {
    item.classList.toggle("resuelto", campoEsValido(item.dataset.campo));
  });
}

// ---------- Eventos ----------

function refrescarFormulario(campo) {
  const formulario = campo.closest("form");
  if (!formulario) return;

  actualizarProgreso(formulario);
  actualizarResumen(formulario);
}

// Al salir de un campo se valida y se arregla lo que se pueda solo
document.addEventListener("focusout", (e) => {
  const campo = e.target;
  const id = campo.id;
  if (!reglas[id]) return;

  if (id === "login-correo" || id === "reg-correo") {
    campo.value = campo.value.trim().toLowerCase();
    setTimeout(() => quitarSugerenciasCorreo(campo), 250);
  }

  if (id === "reg-nombre") campo.value = ponerMayusculas(campo.value.trim());

  // Si la persona no escribió nada y solo pasó por el campo, no se le llama la atención
  const vacio = leerValor(campo) === "";
  if (!vacio || campo.classList.contains("input-error")) validarCampo(id);

  quitarAvisoMayusculas(campo);
  refrescarFormulario(campo);
});

// Mientras escribe: se evitan errores y, si el campo ya tenía aviso, se actualiza al momento
document.addEventListener("input", (e) => {
  const campo = e.target;
  const id = campo.id;
  if (!reglas[id]) return;

  // Si había un aviso general arriba del formulario, se quita al empezar a corregir
  const formulario = campo.closest("form");
  const avisoGeneral = formulario && formulario.querySelector(".auth-alert");
  if (avisoGeneral) avisoGeneral.hidden = true;

  // El teléfono solo acepta números
  if (id === "reg-telefono") {
    campo.value = campo.value.replace(/\D/g, "").slice(0, 10);
  }

  // El nombre acepta letras, espacios, apóstrofes y guiones (María-José, O'Connor)
  if (id === "reg-nombre") {
    campo.value = campo.value.replace(/[^\p{L}\s'’-]/gu, "");
  }

  if (id === "login-correo" || id === "reg-correo") actualizarSugerenciasCorreo(campo);

  if (id === "reg-password") {
    actualizarFuerza(campo);
    actualizarRequisitos(campo);
  }

  const yaTieneAviso = campo.classList.contains("input-error") || campo.classList.contains("input-ok");
  if (yaTieneAviso) validarCampo(id);

  // Si cambia la contraseña, hay que volver a comparar la confirmación
  if (id === "reg-password") {
    const confirmar = document.getElementById("reg-confirmar");
    if (confirmar && confirmar.value) validarCampo("reg-confirmar");
  }

  refrescarFormulario(campo);
});

// El navegador a veces llena la contraseña sin disparar "input"; el select tampoco lo hace
document.addEventListener("change", (e) => {
  if (e.target.id === "reg-password") {
    actualizarRequisitos(e.target);
    actualizarFuerza(e.target);
    return;
  }

  if (e.target.id !== "reg-equipo") return;

  validarCampo("reg-equipo");
  refrescarFormulario(e.target);
});

// ---------- Aviso de mayúsculas activadas ----------

function quitarAvisoMayusculas(campo) {
  const contenedor = campo.closest(".campo");
  const ayuda = contenedor && contenedor.querySelector(".campo-ayuda");
  if (ayuda) ayuda.remove();
}

function revisarMayusculas(e) {
  const campo = e.target;
  if (campo.type !== "password" || !e.getModifierState) return;

  const contenedor = campo.closest(".campo") || campo.parentElement;
  let ayuda = contenedor.querySelector(".campo-ayuda");

  if (e.getModifierState("CapsLock")) {
    if (!ayuda) {
      ayuda = document.createElement("small");
      ayuda.className = "campo-ayuda";
      ayuda.textContent = "Tiene las mayúsculas activadas.";
      contenedor.appendChild(ayuda);
    }
  } else if (ayuda) {
    ayuda.remove();
  }
}

document.addEventListener("keydown", revisarMayusculas);
document.addEventListener("keyup", revisarMayusculas);

// ---------- Envío del formulario ----------

function revisarFormulario(e) {
  const formulario = e.target;
  const campos = Array.from(formulario.querySelectorAll("input, select")).filter((campo) => reglas[campo.id]);
  const camposConError = [];

  campos.forEach((campo) => {
    if (!validarCampo(campo.id)) {
      sacudirCampo(campo);
      camposConError.push(campo);
    }
  });

  if (camposConError.length === 0) {
    quitarResumen(formulario);
    return;
  }

  e.preventDefault();
  e.stopImmediatePropagation(); // para que loginauth.js no siga si hay errores
  mostrarResumen(formulario, camposConError);
  irAlCampo(camposConError[0]);
  actualizarProgreso(formulario);
}

// ---------- Ayudas de teclado para celular ----------

// El celular muestra el teclado correcto para cada campo
const ayudasTeclado = {
  "login-correo": { inputmode: "email", autocapitalize: "none", spellcheck: "false", enterkeyhint: "next", autocomplete: "email" },
  "login-password": { enterkeyhint: "go", autocomplete: "current-password" },
  "reg-nombre": { autocapitalize: "words", enterkeyhint: "next", autocomplete: "name", maxlength: "60" },
  "reg-correo": { inputmode: "email", autocapitalize: "none", spellcheck: "false", enterkeyhint: "next", autocomplete: "email" },
  "reg-telefono": { inputmode: "numeric", enterkeyhint: "next", autocomplete: "tel", maxlength: "10" },
  "reg-password": { enterkeyhint: "next", autocomplete: "new-password" },
  "reg-confirmar": { enterkeyhint: "go", autocomplete: "new-password" }
};

function aplicarAyudasTeclado() {
  Object.keys(ayudasTeclado).forEach((id) => {
    const campo = document.getElementById(id);
    if (!campo) return;

    Object.entries(ayudasTeclado[id]).forEach(([atributo, valor]) => {
      campo.setAttribute(atributo, valor);
    });
  });
}

// ---------- Arranque ----------

function iniciarValidaciones() {
  aplicarAyudasTeclado();

  Object.keys(guias).forEach((id) => mostrarGuiaCampo(id, guias[id]));
  crearMedidorFuerza();

  // Por si el navegador ya llenó la contraseña antes de que cargara el script
  const clave = document.getElementById("reg-password");
  if (clave) {
    actualizarRequisitos(clave);
    actualizarFuerza(clave);
  }

  document.querySelectorAll("form").forEach((formulario) => {
    formulario.noValidate = true; // usamos nuestros propios mensajes

    // La fase de captura corre primero, así que frena el envío aunque el orden de los scripts cambie
    formulario.addEventListener("submit", revisarFormulario, true);
    crearProgreso(formulario);
  });
}

iniciarValidaciones();