# Video de prueba

https://drive.google.com/file/d/1tnWkKOcemGz4nbOibNzn3nMShsljieln/view?usp=drive_link


# Sistema de Reservas de Salas

Sistema compuesto por tres microservicios independientes que demuestra pruebas de contrato (Consumer-Driven Contracts) usando Pact.

El **Servicio de Reservas** (`services/reservas-service`) actúa como proveedor: crea, almacena y consulta reservas de salas, y valida si una reserva existe y está activa. El **Portal de Usuario** (`services/portal-usuario`) es consumidor y permite crear reservas y consultar las reservas de un usuario. El **Servicio de Administración** (`services/admin-service`) también es consumidor y permite verificar si una reserva existe y está activa.

Nota de interpretación: el enunciado de la actividad menciona una "Aplicación de Reserva" como consumidora del Contrato 1 (creación de reservas). En este sistema esa funcionalidad la cubre el Portal de Usuario, que actúa como consumidor tanto del Contrato 1 (crear reserva) como del Contrato 2 (consultar reservas).

## Flujo de pruebas de contrato

Cada consumidor define en sus propias pruebas la solicitud que enviará y la respuesta que espera recibir. Al ejecutar esas pruebas, Pact levanta un servidor simulado que registra la interacción y genera automáticamente un archivo de contrato en `./pacts`. Luego el Servicio de Reservas prepara los datos necesarios (los "provider states") y Pact verifica ese contrato contra el servicio real, confirmando que consumidor y proveedor son compatibles.

## Requisitos

Node.js 20 o superior, y Docker con Docker Compose.

## Levantar el sistema

```
npm install
docker compose up -d --build
```

Esto levanta el Servicio de Reservas en `http://localhost:4000`, el Portal de Usuario en `http://localhost:4001` y el Servicio de Administración en `http://localhost:4002`.

Se puede probar manualmente con:

```
curl -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"U100","sala":"SALA-1","fecha":"2026-09-20","horas":2}'

curl http://localhost:4001/usuarios/U100/reservas

curl http://localhost:4002/reservas/R-1001/validar
```

## Ejecutar las pruebas de los consumidores

```
npm run test:consumers
```

Este comando ejecuta las pruebas de contrato del Portal de Usuario y del Servicio de Administración. Cada prueba define la interacción esperada con el Servicio de Reservas y, al finalizar, Pact escribe automáticamente los contratos generados en la carpeta `./pacts`: `PortalUsuario-ServicioReservas.json` (Contratos 1 y 2) y `ServicioAdministracion-ServicioReservas.json` (Contrato 3). Estos archivos no se editan manualmente, siempre se regeneran a partir de las pruebas.

## Verificar el Servicio de Reservas

Con el Servicio de Reservas corriendo (por ejemplo vía `docker compose up -d`), ejecutar:

```
npm run test:provider
```

Este script (`services/reservas-service/test/verify.js`) usa el Verifier de Pact para leer los contratos generados en `./pacts`, preparar antes de cada interacción el estado de datos requerido mediante una solicitud interna a `POST /_pact/provider-states` (por ejemplo, sembrar una reserva activa para el usuario `U100` o asegurar que el usuario `U200` no tenga reservas), y luego ejecutar la interacción real contra el servicio comparando la respuesta con lo definido en el contrato. Si el proveedor cumple con las expectativas de ambos consumidores, la verificación finaliza sin errores.

## Estados de prueba del proveedor

El archivo `services/reservas-service/src/providerStates.js` define los estados reproducibles que el Servicio de Reservas puede preparar antes de una verificación:

| Estado | Efecto |
|---|---|
| el usuario U100 tiene una reserva activa | Limpia el almacenamiento y crea una reserva activa para U100 |
| el usuario U200 no tiene reservas | Elimina cualquier reserva asociada a U200 |
| la reserva R-1001 existe y esta activa | Crea la reserva con id fijo R-1001, activa |
| la reserva no existe | Asegura que el id R-9999 no exista en el almacenamiento |
| el sistema esta listo para crear una reserva | Reinicia el almacenamiento a un estado limpio |

## Ejecutar todo el flujo de una vez

```
docker compose up -d --build
npm run test:consumers
npm run test:provider
```

## Dificultades encontradas durante el desarrollo

Definir los nombres de los provider states de forma que fueran exactamente iguales entre las pruebas de consumidor (`given(...)`) y los stateHandlers del verificador costó algunas iteraciones, ya que cualquier diferencia de texto hace que el estado no se reconozca.

Al principio se apuntó el verificador directamente a la carpeta `pacts` en lugar de a los archivos JSON individuales, lo que provocaba errores de parseo. Se resolvió listando explícitamente los archivos de contrato antes de pasarlos al Verifier.

También hubo que coordinar bien qué servicio consumía a cuál, ya que el enunciado nombra una "Aplicación de Reserva" que no está definida como servicio aparte. Se acordó que esa responsabilidad la cubre el Portal de Usuario, como se explica en la nota de interpretación al inicio de este documento.

## Contribuciones del equipo

Camilo Rojas se encargó del diseño general de la arquitectura, la implementación del Servicio de Reservas (proveedor), la definición de los estados de prueba y de la verificación con Pact, además de la gestión del repositorio y los commits.

Nicolas Llancaqueo se encargó de la implementación del Portal de Usuario y del Servicio de Administración (consumidores), la definición y escritura de los contratos Pact, y la redacción de la documentación de uso en este README.

Armin Hucke se encargó de la contenedorización de los microservicios, la configuración de Docker y docker-compose.yml para la orquestación del sistema, y la creación de los scripts automatizados de npm (test:consumers, test:provider) para estandarizar la ejecución de pruebas en los distintos entornos.