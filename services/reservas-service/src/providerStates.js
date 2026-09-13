const store = require("./store");

const estados = {
  "el usuario U100 tiene una reserva activa": () => {
    store.resetStore();
    store.sembrarReserva({
      id: "R-2001",
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-09-20",
      horas: 2,
      estado: "activa",
    });
  },

  "el usuario U200 no tiene reservas": () => {
    store.eliminarPorUsuario("U200");
  },

  "la reserva R-1001 existe y esta activa": () => {
    store.eliminarPorId("R-1001");
    store.sembrarReserva({
      id: "R-1001",
      usuarioId: "U100",
      sala: "SALA-2",
      fecha: "2026-09-25",
      horas: 3,
      estado: "activa",
    });
  },

  "la reserva no existe": () => {
    store.eliminarPorId("R-9999");
  },

  "el sistema esta listo para crear una reserva": () => {
    store.resetStore();
  },
};

function prepararEstado(nombreEstado) {
  const preparar = estados[nombreEstado];
  if (!preparar) {
    throw new Error(`Estado de prueba desconocido: ${nombreEstado}`);
  }
  preparar();
}

module.exports = { prepararEstado, estados };
