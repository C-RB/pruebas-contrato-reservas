const path = require("path");
const { PactV3, MatchersV3 } = require("@pact-foundation/pact");
const { crearCliente } = require("../../src/reservasClient");

const { like, eachLike, integer } = MatchersV3;

const provider = new PactV3({
  consumer: "PortalUsuario",
  provider: "ServicioReservas",
  dir: path.resolve(__dirname, "../../../../pacts"),
});

describe("Portal de Usuario -> Servicio de Reservas", () => {
  it("crea una reserva con datos validos", () => {
    provider
      .given("el sistema esta listo para crear una reserva")
      .uponReceiving("una solicitud para crear una reserva valida")
      .withRequest({
        method: "POST",
        path: "/reservas",
        headers: { "Content-Type": "application/json" },
        body: { usuarioId: "U100", sala: "SALA-1", fecha: "2026-09-20", horas: 2 },
      })
      .willRespondWith({
        status: 201,
        headers: { "Content-Type": "application/json" },
        body: {
          id: like("R-1001"),
          usuarioId: "U100",
          sala: "SALA-1",
          fecha: "2026-09-20",
          horas: integer(2),
          estado: "activa",
        },
      });

    return provider.executeTest(async (mockserver) => {
      const cliente = crearCliente(mockserver.url);
      const reserva = await cliente.crearReserva({
        usuarioId: "U100",
        sala: "SALA-1",
        fecha: "2026-09-20",
        horas: 2,
      });

      expect(reserva.estado).toBe("activa");
      expect(reserva.id).toBeDefined();
    });
  });

  it("rechaza una reserva con cero horas", () => {
    provider
      .uponReceiving("una solicitud para crear una reserva con horas invalidas")
      .withRequest({
        method: "POST",
        path: "/reservas",
        headers: { "Content-Type": "application/json" },
        body: { usuarioId: "U100", sala: "SALA-1", fecha: "2026-09-20", horas: 0 },
      })
      .willRespondWith({
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: { error: like("La cantidad de horas debe ser mayor a cero") },
      });

    return provider.executeTest(async (mockserver) => {
      const cliente = crearCliente(mockserver.url);
      await expect(
        cliente.crearReserva({ usuarioId: "U100", sala: "SALA-1", fecha: "2026-09-20", horas: 0 })
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  it("retorna las reservas de un usuario con reservas activas", () => {
    provider
      .given("el usuario U100 tiene una reserva activa")
      .uponReceiving("una solicitud de las reservas del usuario U100")
      .withRequest({
        method: "GET",
        path: "/usuarios/U100/reservas",
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: eachLike({
          id: like("R-2001"),
          usuarioId: "U100",
          sala: like("SALA-1"),
          fecha: like("2026-09-20"),
          horas: integer(2),
          estado: "activa",
        }),
      });

    return provider.executeTest(async (mockserver) => {
      const cliente = crearCliente(mockserver.url);
      const reservas = await cliente.obtenerReservasDeUsuario("U100");

      expect(Array.isArray(reservas)).toBe(true);
      expect(reservas.length).toBeGreaterThan(0);
      expect(reservas[0].estado).toBe("activa");
    });
  });

  it("retorna una lista vacia para un usuario sin reservas", () => {
    provider
      .given("el usuario U200 no tiene reservas")
      .uponReceiving("una solicitud de las reservas del usuario U200")
      .withRequest({
        method: "GET",
        path: "/usuarios/U200/reservas",
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: [],
      });

    return provider.executeTest(async (mockserver) => {
      const cliente = crearCliente(mockserver.url);
      const reservas = await cliente.obtenerReservasDeUsuario("U200");

      expect(reservas).toEqual([]);
    });
  });
});
