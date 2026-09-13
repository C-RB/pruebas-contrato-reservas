const axios = require("axios");

function crearCliente(baseUrl) {
  return {
    async validarReserva(id) {
      const respuesta = await axios.get(`${baseUrl}/reservas/${id}/validar`);
      return respuesta.data;
    },
  };
}

module.exports = { crearCliente };
