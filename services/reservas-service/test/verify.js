const fs = require("fs");
const path = require("path");
const { Verifier } = require("@pact-foundation/pact");
const axios = require("axios");

const providerBaseUrl = process.env.PROVIDER_BASE_URL || "http://localhost:4000";
const pactsDir = path.resolve(__dirname, "../../../pacts");
const pactUrls = fs
  .readdirSync(pactsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => path.join(pactsDir, file));

const opts = {
  provider: "ServicioReservas",
  providerBaseUrl,
  pactUrls,
  stateHandlers: {
    "el usuario U100 tiene una reserva activa": async () => {
      await axios.post(`${providerBaseUrl}/_pact/provider-states`, {
        state: "el usuario U100 tiene una reserva activa",
      });
      return "estado preparado";
    },
    "el usuario U200 no tiene reservas": async () => {
      await axios.post(`${providerBaseUrl}/_pact/provider-states`, {
        state: "el usuario U200 no tiene reservas",
      });
      return "estado preparado";
    },
    "la reserva R-1001 existe y esta activa": async () => {
      await axios.post(`${providerBaseUrl}/_pact/provider-states`, {
        state: "la reserva R-1001 existe y esta activa",
      });
      return "estado preparado";
    },
    "la reserva no existe": async () => {
      await axios.post(`${providerBaseUrl}/_pact/provider-states`, {
        state: "la reserva no existe",
      });
      return "estado preparado";
    },
    "el sistema esta listo para crear una reserva": async () => {
      await axios.post(`${providerBaseUrl}/_pact/provider-states`, {
        state: "el sistema esta listo para crear una reserva",
      });
      return "estado preparado";
    },
  },
};

new Verifier(opts)
  .verifyProvider()
  .then(() => {
    console.log("Verificacion de contratos completada exitosamente");
    process.exit(0);
  })
  .catch((err) => {
    console.error("La verificacion de contratos fallo");
    console.error(err);
    process.exit(1);
  });
