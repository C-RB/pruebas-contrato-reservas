const path = require("path");
const { PactV3, MatchersV3 } = require("@pact-foundation/pact");
const { crearCliente } = require("../../src/reservasClient");

const { boolean } = MatchersV3;

const provider = new PactV3({
  consumer: "ServicioAdministracion",
  provider: "ServicioReservas",
  dir: path.resolve(__dirname, "../../../../pacts"),
});

describe("Servicio de Administracion -> Servicio de Reservas", () => {
  it("valida una reserva existente y activa", () => {
    provider
      .given("la reserva R-1001 existe y esta activa")
      .uponReceiving("una solicitud para validar la reserva R-1001")
      .withRequest({
        method: "GET",
        path: "/reservas/R-1001/validar",
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { id: "R-1001", valida: true },
      });

    return provider.executeTest(async (mockserver) => {
      const cliente = crearCliente(mockserver.url);
      const resultado = await cliente.validarReserva("R-1001");

      expect(resultado.valida).toBe(true);
    });
  });

  it("indica que una reserva inexistente no es valida", () => {
    provider
      .given("la reserva no existe")
      .uponReceiving("una solicitud para validar una reserva inexistente")
      .withRequest({
        method: "GET",
        path: "/reservas/R-9999/validar",
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { id: "R-9999", valida: boolean(false) },
      });

    return provider.executeTest(async (mockserver) => {
      const cliente = crearCliente(mockserver.url);
      const resultado = await cliente.validarReserva("R-9999");

      expect(resultado.valida).toBe(false);
    });
  });
});
