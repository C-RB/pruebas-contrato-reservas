const express = require("express");
const { crearCliente } = require("./reservasClient");

const app = express();
app.use(express.json());

const RESERVAS_URL = process.env.RESERVAS_URL || "http://localhost:4000";
const cliente = crearCliente(RESERVAS_URL);

app.get("/reservas/:id/validar", async (req, res) => {
  try {
    const resultado = await cliente.validarReserva(req.params.id);
    return res.status(200).json(resultado);
  } catch (err) {
    return res.status(502).json({ error: "No se pudo contactar al Servicio de Reservas" });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`Servicio de Administracion escuchando en el puerto ${PORT}`);
  });
}
