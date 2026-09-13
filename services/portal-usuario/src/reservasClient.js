const axios = require("axios");

function crearCliente(baseUrl) {
  return {
    async crearReserva({ usuarioId, sala, fecha, horas }) {
      const respuesta = await axios.post(`${baseUrl}/reservas`, {
        usuarioId,
        sala,
        fecha,
        horas,
      });
      return respuesta.data;
    },

    async obtenerReservasDeUsuario(usuarioId) {
      const respuesta = await axios.get(`${baseUrl}/usuarios/${usuarioId}/reservas`);
      return respuesta.data;
    },
  };
}

module.exports = { crearCliente };
