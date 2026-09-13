const express = require("express");
const store = require("./store");
const { prepararEstado } = require("./providerStates");

const app = express();
app.use(express.json());

app.post("/reservas", (req, res) => {
  const { usuarioId, sala, fecha, horas } = req.body;
  const resultado = store.crearReserva({ usuarioId, sala, fecha, horas });

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  return res.status(201).json(resultado.reserva);
});

app.get("/usuarios/:usuarioId/reservas", (req, res) => {
  const reservas = store.listarPorUsuario(req.params.usuarioId);
  return res.status(200).json(reservas);
});

app.get("/reservas/:id/validar", (req, res) => {
  const reserva = store.obtenerPorId(req.params.id);
  const valida = Boolean(reserva && reserva.estado === "activa");
  return res.status(200).json({ id: req.params.id, valida });
});

app.post("/_pact/provider-states", (req, res) => {
  const { state } = req.body;
  try {
    prepararEstado(state);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servicio de Reservas escuchando en el puerto ${PORT}`);
  });
}
