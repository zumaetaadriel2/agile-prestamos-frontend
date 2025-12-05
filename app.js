// CUANDO SUBAS A RENDER, CAMBIA ESTA URL
// const API_URL = '';
const API_URL = 'https://agile-prestamos.onrender.com';

let emailClienteSeleccionado = null;

function log(obj) {
  const div = document.getElementById('resultado');
  div.textContent = JSON.stringify(obj, null, 2);
}

// LOGIN
function iniciarSesion() {
  const u = document.getElementById('login-usuario').value;
  const p = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');

  if (u === 'admin' && p === '1234') {
    msg.textContent = 'Ingreso exitoso';
    document.getElementById('seccion-login').classList.add('oculto');
    document.getElementById('app').classList.remove('oculto');
  } else {
    msg.textContent = 'Usuario o contraseña incorrectos (prueba admin / 1234)';
  }
}

function recuperarContrasena() {
  const u = document.getElementById('login-usuario').value || '(sin usuario)';
  alert('Simulación: se enviaría un enlace de recuperación al correo del usuario ' + u);
}

// 1. CLIENTES: buscar en BD, si no existe usar API
async function crearClienteDesdeApi() {
  const tipo = document.getElementById('cliente-tipo').value;
  const doc = document.getElementById('cliente-doc').value;
  const email = document.getElementById('cliente-email').value;
  const tel = document.getElementById('cliente-tel').value;

  try {
    const res = await fetch(API_URL + '/clientes/buscar-o-crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, documento: doc, email, telefono: tel })
    });
    const data = await res.json();
    log(data);
  } catch (err) {
    log({ error: err.message });
  }
}

// 2. PRESTAMOS
async function crearPrestamo() {
  const cliente_id = Number(document.getElementById('prestamo-cliente-id').value);
  const monto_total = Number(document.getElementById('prestamo-monto').value);
  const num_cuotas = Number(document.getElementById('prestamo-cuotas').value);

  try {
    const res = await fetch(API_URL + '/prestamos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente_id, monto_total, num_cuotas })
    });
    const data = await res.json();
    log(data);
  } catch (err) {
    log({ error: err.message });
  }
}

async function verPrestamoCliente() {
  const cliente_id = Number(document.getElementById('ver-cliente-id').value);
  try {
    const res = await fetch(API_URL + '/prestamos/cliente/' + cliente_id);
    const data = await res.json();

    if (data.prestamo) {
      emailClienteSeleccionado = data.prestamo.cliente_email || null;

      const cuotas = data.cuotas || [];
      const lines = cuotas.map(c =>
        `Cuota ${c.numero_cuota} | id=${c.id} | vence=${c.fecha_vencimiento} | saldo=${c.saldo_pendiente}`
      ).join('\n');

      document.getElementById('cronograma').textContent = lines || 'Sin cuotas';
      log(data.prestamo);
    } else {
      log(data);
    }
  } catch (err) {
    log({ error: err.message });
  }
}

// 3. PAGOS
async function registrarPago() {
  const cuota_id = Number(document.getElementById('pago-cuota-id').value);
  const monto_pagado = Number(document.getElementById('pago-monto').value);
  const medio_pago = document.getElementById('pago-medio').value;

  try {
    const cuerpo = { cuota_id, monto_pagado, medio_pago };

    if (emailClienteSeleccionado) {
      cuerpo.canal_comprobante = 'EMAIL';
      cuerpo.email = emailClienteSeleccionado;
    }

    const res = await fetch(API_URL + '/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    });
    const data = await res.json();
    log(data);
  } catch (err) {
    log({ error: err.message });
  }
}

async function verHistorialPagos() {
  const cuota_id = Number(document.getElementById('hist-cuota-id').value);
  try {
    const res = await fetch(API_URL + '/pagos/historial/' + cuota_id);
    const data = await res.json();
    log(data);
  } catch (err) {
    log({ error: err.message });
  }
}

// 4. CAJA (sesiones)
async function abrirCaja() {
  const monto_inicial = Number(document.getElementById('caja-inicial').value);
  try {
    const res = await fetch(API_URL + '/caja/apertura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto_inicial })
    });
    const data = await res.json();
    log(data);
  } catch (err) {
    log({ error: err.message });
  }
}

async function resumenCaja() {
  try {
    const res = await fetch(API_URL + '/caja/resumen-actual');
    const data = await res.json();
    log(data);
    if (data.total_teorico != null) {
      document.getElementById('caja-total-real').value = data.total_teorico;
    }
  } catch (err) {
    log({ error: err.message });
  }
}

async function cerrarCaja() {
  const total_real = Number(document.getElementById('caja-total-real').value);
  try {
    const res = await fetch(API_URL + '/caja/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_real })
    });
    const data = await res.json();
    log(data);
  } catch (err) {
    log({ error: err.message });
  }
}
