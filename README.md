# Sistema de Reservas de Salas — Pruebas de Contrato con Pact

Sistema compuesto por tres microservicios independientes que demuestra pruebas de contrato
(Consumer-Driven Contracts) usando Pact:

- **Servicio de Reservas** (`services/reservas-service`): proveedor. Crea, almacena y consulta
  reservas de salas, y valida si una reserva existe y está activa.
- **Portal de Usuario** (`services/portal-usuario`): consumidor. Permite crear reservas y consultar
  las reservas de un usuario.
- **Servicio de Administración** (`services/admin-service`): consumidor. Permite verificar si una
  reserva existe y está activa.

> Nota de interpretación: el enunciado de la actividad menciona una "Aplicación de Reserva" como
> consumidora del Contrato 1 (creación de reservas). En este sistema esa funcionalidad la cubre el
> **Portal de Usuario**, que actúa como consumidor tanto del Contrato 1 (crear reserva) como del
> Contrato 2 (consultar reservas).

## Arquitectura y flujo de pruebas de contrato

```
Portal de Usuario  ──┐
                      ├──> genera contratos (pacts/*.json) ──> Servicio de Reservas (proveedor real)
Servicio de Admin. ───┘
```

1. Cada consumidor define, en sus propias pruebas, la solicitud que enviará y la respuesta que
   espera recibir.
2. Al ejecutar esas pruebas, Pact levanta un servidor simulado (mock) que registra la interacción y
   genera automáticamente un archivo de contrato en `./pacts`.
3. El Servicio de Reservas prepara los datos necesarios ("provider states") y luego Pact verifica
   ese contrato contra el servicio real, confirmando que ambas partes son compatibles.

## Requisitos

- Node.js 20+
- Docker y Docker Compose

## Cómo levantar el sistema

```bash
npm install
docker compose up -d --build
```

Esto levanta los tres servicios:

- Servicio de Reservas: `http://localhost:4000`
- Portal de Usuario: `http://localhost:4001`
- Servicio de Administración: `http://localhost:4002`

Puedes probar manualmente, por ejemplo:

```bash
curl -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"U100","sala":"SALA-1","fecha":"2026-09-20","horas":2}'

curl http://localhost:4001/usuarios/U100/reservas

curl http://localhost:4002/reservas/R-1001/validar
```

## Cómo ejecutar las pruebas de los consumidores (generar los contratos Pact)

```bash
npm run test:consumers
```

Este comando ejecuta las pruebas de contrato del Portal de Usuario y del Servicio de Administración.
Cada prueba define la interacción esperada con el Servicio de Reservas y, al finalizar, Pact escribe
automáticamente los contratos generados en la carpeta `./pacts`:

- `pacts/PortalUsuario-ServicioReservas.json` (Contratos 1 y 2)
- `pacts/ServicioAdministracion-ServicioReservas.json` (Contrato 3)

Estos archivos **no se editan manualmente**: siempre se regeneran a partir de las pruebas.

## Cómo verificar el Servicio de Reservas contra los contratos generados

Con el Servicio de Reservas corriendo (por ejemplo vía `docker compose up -d`), ejecutar:

```bash
npm run test:provider
```

Este script (`services/reservas-service/test/verify.js`) usa el `Verifier` de Pact para:

1. Leer los contratos generados en `./pacts`.
2. Antes de cada interacción, preparar el estado de datos requerido mediante una solicitud interna a
   `POST /_pact/provider-states` (por ejemplo: sembrar una reserva activa para el usuario `U100`, o
   asegurar que el usuario `U200` no tenga reservas).
3. Ejecutar la interacción real contra el servicio y comparar la respuesta con lo definido en el
   contrato.

Si el proveedor real cumple con las expectativas de ambos consumidores, la verificación finaliza sin
errores.

## Estados de prueba del proveedor

El archivo `services/reservas-service/src/providerStates.js` define los estados reproducibles que el
Servicio de Reservas puede preparar antes de una verificación:

| Estado | Efecto |
|---|---|
| `el usuario U100 tiene una reserva activa` | Limpia el almacenamiento y crea una reserva activa para U100 |
| `el usuario U200 no tiene reservas` | Elimina cualquier reserva asociada a U200 |
| `la reserva R-1001 existe y esta activa` | Crea (o recrea) la reserva con id fijo `R-1001`, activa |
| `la reserva no existe` | Asegura que el id `R-9999` no exista en el almacenamiento |
| `el sistema esta listo para crear una reserva` | Reinicia el almacenamiento a un estado limpio |

## Ejecutar todo el flujo de una vez

```bash
docker compose up -d --build
npm run test:consumers
npm run test:provider
```

## Dificultades encontradas durante el desarrollo

_(completar por el equipo al finalizar la implementación y las pruebas)_

## Contribuciones del equipo

| Integrante | Aportes |
|---|---|
| _Nombre 1_ | _(completar)_ |
| _Nombre 2_ | _(completar)_ |
| _Nombre 3_ | _(completar)_ |
