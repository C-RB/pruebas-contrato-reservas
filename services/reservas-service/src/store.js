let reservas = [];
let contador = 0;

function resetStore() {
  reservas = [];
  contador = 0;
}

function generarId() {
  contador += 1;
  return `R-${1000 + contador}`;
}

function crearReserva({ usuarioId, sala, fecha, horas }) {
  if (typeof horas !== "number" || horas <= 0) {
    return { error: "La cantidad de horas debe ser mayor a cero" };
  }

  const reserva = {
    id: generarId(),
    usuarioId,
    sala,
    fecha,
    horas,
    estado: "activa",
  };

  reservas.push(reserva);
  return { reserva };
}

function listarPorUsuario(usuarioId) {
  return reservas.filter((r) => r.usuarioId === usuarioId);
}

function obtenerPorId(id) {
  return reservas.find((r) => r.id === id) || null;
}

function sembrarReserva({ id, usuarioId, sala, fecha, horas, estado }) {
  reservas.push({
    id,
    usuarioId,
    sala: sala || "SALA-1",
    fecha: fecha || "2026-01-01",
    horas: horas || 1,
    estado: estado || "activa",
  });
}

function eliminarPorUsuario(usuarioId) {
  reservas = reservas.filter((r) => r.usuarioId !== usuarioId);
}

function eliminarPorId(id) {
  reservas = reservas.filter((r) => r.id !== id);
}

module.exports = {
  resetStore,
  crearReserva,
  listarPorUsuario,
  obtenerPorId,
  sembrarReserva,
  eliminarPorUsuario,
  eliminarPorId,
};
