/* =========================================================
   Zona DRS · Módulo de avisos
   Uso:
     Avisos.toast('Producto agregado al carrito', { tipo: 'exito' });
     Avisos.toast('No hay stock', { tipo: 'error', titulo: 'Ups' });

     const ok = await Avisos.confirmar({
       titulo: 'Vaciar carrito',
       mensaje: '¿Seguro que desea eliminar todos los productos?'
     });
     if (ok) { ... }

   Tipos: 'exito' | 'error' | 'alerta' | 'info'
   Requiere: Bootstrap 5 (bundle) cargado antes que este archivo.
   ========================================================= */
(function () {
  'use strict';

  var ICONOS = { exito: '✓', error: '✕', alerta: '!', info: 'i' };
  var region = null;
  var contadorId = 0;

  function obtenerRegion() {
    if (region && document.body.contains(region)) return region;
    region = document.createElement('div');
    region.className = 'avisos-region';
    document.body.appendChild(region);
    return region;
  }

  function el(tag, clase, texto) {
    var nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto; // textContent evita inyección de HTML
    return nodo;
  }

  /* ---------------- Toast ---------------- */
  function toast(mensaje, opciones) {
    var o = Object.assign({ tipo: 'info', duracion: 5000, titulo: '' }, opciones);
    if (!ICONOS[o.tipo]) o.tipo = 'info';

    var aviso = el('div', 'aviso aviso--' + o.tipo);
    // error/alerta se anuncian de inmediato; el resto de forma cortés
    aviso.setAttribute('role', o.tipo === 'error' || o.tipo === 'alerta' ? 'alert' : 'status');

    var icono = el('span', 'aviso__icono', ICONOS[o.tipo]);
    icono.setAttribute('aria-hidden', 'true');

    var cuerpo = el('div', 'aviso__cuerpo');
    if (o.titulo) cuerpo.appendChild(el('p', 'aviso__titulo', o.titulo));
    cuerpo.appendChild(el('p', 'aviso__texto', mensaje));

    var cerrar = el('button', 'aviso__cerrar', '×');
    cerrar.type = 'button';
    cerrar.setAttribute('aria-label', 'Cerrar aviso');

    aviso.appendChild(icono);
    aviso.appendChild(cuerpo);
    aviso.appendChild(cerrar);
    obtenerRegion().appendChild(aviso);

    var temporizador = null;
    var restante = o.duracion;
    var inicio = 0;

    function cerrarAviso() {
      clearTimeout(temporizador);
      if (!aviso.parentNode) return;
      aviso.classList.add('saliendo');
      setTimeout(function () { if (aviso.parentNode) aviso.remove(); }, 220);
    }
    function arrancar() {
      if (!restante || restante <= 0) return;   // duracion 0 = no se cierra solo
      inicio = Date.now();
      temporizador = setTimeout(cerrarAviso, restante);
    }
    function pausar() {
      clearTimeout(temporizador);
      if (inicio) restante -= Date.now() - inicio;
    }

    cerrar.addEventListener('click', cerrarAviso);
    aviso.addEventListener('mouseenter', pausar);
    aviso.addEventListener('mouseleave', arrancar);
    aviso.addEventListener('focusin', pausar);
    aviso.addEventListener('focusout', arrancar);
    aviso.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarAviso(); });

    arrancar();
    return cerrarAviso;
  }

  /* ---------------- Modal de confirmación ---------------- */
  function confirmar(opciones) {
    var o = Object.assign({
      titulo: 'Confirmar',
      mensaje: '',
      textoConfirmar: 'Aceptar',
      textoCancelar: 'Cancelar'
    }, opciones);

    // Respaldo si Bootstrap no cargó
    if (!window.bootstrap || !window.bootstrap.Modal) {
      return Promise.resolve(window.confirm(o.titulo + '\n\n' + o.mensaje));
    }

    return new Promise(function (resolver) {
      var id = 'avisoModal' + (++contadorId);
      var resultado = false;

      var modal = el('div', 'modal fade aviso-modal');
      modal.id = id;
      modal.tabIndex = -1;
      modal.setAttribute('aria-labelledby', id + 'Titulo');
      modal.setAttribute('aria-describedby', id + 'Texto');
      modal.setAttribute('aria-hidden', 'true');

      var dialogo = el('div', 'modal-dialog modal-dialog-centered');
      var contenido = el('div', 'modal-content');

      var cabecera = el('div', 'modal-header');
      var titulo = el('h2', 'modal-title', o.titulo);
      titulo.id = id + 'Titulo';
      var x = el('button', 'btn-close');
      x.type = 'button';
      x.setAttribute('data-bs-dismiss', 'modal');
      x.setAttribute('aria-label', 'Cerrar');
      cabecera.appendChild(titulo);
      cabecera.appendChild(x);

      var cuerpo = el('div', 'modal-body');
      var texto = el('p', '', o.mensaje);
      texto.id = id + 'Texto';
      texto.style.margin = '0';
      cuerpo.appendChild(texto);

      var pie = el('div', 'modal-footer');
      var btnCancelar = el('button', 'aviso-btn', o.textoCancelar);
      btnCancelar.type = 'button';
      btnCancelar.setAttribute('data-bs-dismiss', 'modal');
      var btnOk = el('button', 'aviso-btn aviso-btn--principal', o.textoConfirmar);
      btnOk.type = 'button';
      pie.appendChild(btnCancelar);
      pie.appendChild(btnOk);

      contenido.appendChild(cabecera);
      contenido.appendChild(cuerpo);
      contenido.appendChild(pie);
      dialogo.appendChild(contenido);
      modal.appendChild(dialogo);
      document.body.appendChild(modal);

      var instancia = new window.bootstrap.Modal(modal);

      btnOk.addEventListener('click', function () {
        resultado = true;
        instancia.hide();
      });
      modal.addEventListener('shown.bs.modal', function () { btnCancelar.focus(); }); // opción segura primero
      modal.addEventListener('hidden.bs.modal', function () {
        instancia.dispose();
        modal.remove();
        resolver(resultado);
      });

      instancia.show();
    });
  }

  window.Avisos = { toast: toast, confirmar: confirmar };
})();