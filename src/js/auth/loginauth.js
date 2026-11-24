// Esta función muestra en consola los usuarios guardados hasta el momento.
function verUsuarios() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));

  if (usuarios === null) {
    usuarios = [];
  }

  console.log(JSON.stringify(usuarios, null, 2));
}

// Este código solo se ejecuta si la página tiene el formulario de registro.
let formularioRegistro = document.getElementById("form-registro");

if (formularioRegistro !== null) {
  formularioRegistro.addEventListener("submit", function (evento) {
    // Evita que el formulario recargue la página antes de validar los datos.
    evento.preventDefault();

    // Lee los valores de todos los campos del formulario de registro.
    let nombre = document.getElementById("reg-nombre").value;
    let correo = document.getElementById("reg-correo").value;
    let telefono = document.getElementById("reg-telefono").value;
    let equipo = document.getElementById("reg-equipo").value;
    let password = document.getElementById("reg-password").value;
    let confirmar = document.getElementById("reg-confirmar").value;

    // Comprueba que ningún campo esté vacío antes de continuar.
    if (nombre === "" || correo === "" || telefono === "" || equipo === "" || password === "" || confirmar === "") {
      alert("Complete todos los campos");
      return;
    }

    // Comprueba que la contraseña tenga por lo menos ocho caracteres.
    if (password.length < 8) {
      alert("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    // Revisa con un ciclo si la contraseña tiene una mayúscula y un carácter especial.
    let tieneMayuscula = false;
    let tieneEspecial = false;
    let mayusculas = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    let caracteresEspeciales = "*!@#$%&._-";

    for (let i = 0; i < password.length; i++) {
      if (mayusculas.includes(password[i])) {
        tieneMayuscula = true;
      }

      if (caracteresEspeciales.includes(password[i])) {
        tieneEspecial = true;
      }
    }

    // Detiene el registro y explica cuál requisito de contraseña falta.
    if (tieneMayuscula === false) {
      alert("La contraseña debe incluir al menos una letra mayúscula");
      return;
    } else if (tieneEspecial === false) {
      alert("La contraseña debe incluir al menos un carácter especial");
      return;
    }

    // Comprueba que la contraseña escrita dos veces sea la misma.
    if (password !== confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Carga la lista de usuarios guardada o comienza con un arreglo vacío.
    let usuarios = JSON.parse(localStorage.getItem("usuarios"));

    if (usuarios === null) {
      usuarios = [];
    }

    // Evita registrar un correo que ya esté guardado.
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].correo === correo) {
        alert("Este correo ya está registrado");
        return;
      }
    }

    // Crea el usuario, lo agrega a la lista y guarda la lista como JSON.
    let usuario = {
      nombre: nombre,
      correo: correo,
      telefono: telefono,
      equipo: equipo,
      password: password
    };

    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Muestra la lista guardada, confirma el registro y abre el inicio de sesión.
    console.log(JSON.stringify(usuarios, null, 2));
    alert("Registro exitoso");
    window.location.href = "login.html";
  });
}

// Este código solo se ejecuta si la página tiene el formulario de inicio de sesión.
let formularioLogin = document.getElementById("form-login");

if (formularioLogin !== null) {
  formularioLogin.addEventListener("submit", function (evento) {
    // Evita que el formulario recargue la página antes de validar los datos.
    evento.preventDefault();

    // Lee el correo y la contraseña que se escribieron en el formulario.
    let correo = document.getElementById("login-correo").value;
    let password = document.getElementById("login-password").value;

    // Comprueba que el correo y la contraseña no estén vacíos.
    if (correo === "" || password === "") {
      alert("Ingrese su correo y contraseña");
      return;
    }

    // Carga la lista guardada o usa una lista vacía si todavía no hay usuarios.
    let usuarios = JSON.parse(localStorage.getItem("usuarios"));

    if (usuarios === null) {
      usuarios = [];
    }

    // Busca un usuario que coincida con el correo y la contraseña ingresados.
    let usuarioEncontrado = null;

    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].correo === correo && usuarios[i].password === password) {
        usuarioEncontrado = usuarios[i];
      }
    }

    // Si encontró al usuario, lo guarda y abre el dashboard de administración.
    if (usuarioEncontrado !== null) {
      localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));
      console.log(JSON.stringify(usuarioEncontrado, null, 2));
      alert("Bienvenido");
      window.location.href = "../../pages/admin/dashboard.html";
    } else {
      // Si no encontró una coincidencia, informa que los datos son incorrectos.
      alert("Correo o contraseña incorrectos");
    }
  });
}

// Este botón permite mostrar u ocultar la contraseña del inicio de sesión.
let botonVerLoginPassword = document.getElementById("btn-ver-login-password");

if (botonVerLoginPassword !== null) {
  botonVerLoginPassword.addEventListener("click", function () {
    let campoPasswordLogin = document.getElementById("login-password");

    if (campoPasswordLogin.type === "password") {
      campoPasswordLogin.type = "text";
      botonVerLoginPassword.setAttribute("aria-label", "Ocultar contraseña");
      botonVerLoginPassword.setAttribute("aria-pressed", "true");
    } else {
      campoPasswordLogin.type = "password";
      botonVerLoginPassword.setAttribute("aria-label", "Mostrar contraseña");
      botonVerLoginPassword.setAttribute("aria-pressed", "false");
    }
  });
}

// Este botón permite mostrar u ocultar la contraseña nueva del registro.
let botonVerRegistroPassword = document.getElementById("btn-ver-reg-password");

if (botonVerRegistroPassword !== null) {
  botonVerRegistroPassword.addEventListener("click", function () {
    let campoPasswordRegistro = document.getElementById("reg-password");

    if (campoPasswordRegistro.type === "password") {
      campoPasswordRegistro.type = "text";
      botonVerRegistroPassword.setAttribute("aria-label", "Ocultar contraseña");
      botonVerRegistroPassword.setAttribute("aria-pressed", "true");
    } else {
      campoPasswordRegistro.type = "password";
      botonVerRegistroPassword.setAttribute("aria-label", "Mostrar contraseña");
      botonVerRegistroPassword.setAttribute("aria-pressed", "false");
    }
  });
}

// Este botón permite mostrar u ocultar la confirmación de contraseña.
let botonVerConfirmacionPassword = document.getElementById("btn-ver-reg-confirmar");

if (botonVerConfirmacionPassword !== null) {
  botonVerConfirmacionPassword.addEventListener("click", function () {
    let campoConfirmarPassword = document.getElementById("reg-confirmar");

    if (campoConfirmarPassword.type === "password") {
      campoConfirmarPassword.type = "text";
      botonVerConfirmacionPassword.setAttribute("aria-label", "Ocultar confirmación de contraseña");
      botonVerConfirmacionPassword.setAttribute("aria-pressed", "true");
    } else {
      campoConfirmarPassword.type = "password";
      botonVerConfirmacionPassword.setAttribute("aria-label", "Mostrar confirmación de contraseña");
      botonVerConfirmacionPassword.setAttribute("aria-pressed", "false");
    }
  });
}
