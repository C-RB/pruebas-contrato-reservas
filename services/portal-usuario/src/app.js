const express = require("express");
const { crearCliente } = require("./reservasClient");

const app = express();
app.use(express.json());

const RESERVAS_URL = process.env.RESERVAS_URL || "http://localhost:4000";
const cliente = crearCliente(RESERVAS_URL);

app.post("/reservas", async (req, res) => {
  try {
    const reserva = await cliente.crearReserva(req.body);
    return res.status(201).json(reserva);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(502).json({ error: "No se pudo contactar al Servicio de Reservas" });
  }
});

app.get("/usuarios/:usuarioId/reservas", async (req, res) => {
  try {
    const reservas = await cliente.obtenerReservasDeUsuario(req.params.usuarioId);
    return res.status(200).json(reservas);
  } catch (err) {
    return res.status(502).json({ error: "No se pudo contactar al Servicio de Reservas" });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`Portal de Usuario escuchando en el puerto ${PORT}`);
  });
}
