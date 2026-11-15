# ExcelLoaderService — contexto para Claude

Servicio de carga de planillas Excel con validación de formato y seguimiento del estado de procesamiento. Node.js + Express + TypeScript, RabbitMQ como broker y MongoDB (Mongoose). Proyecto de portfolio: el código y los README se leen desde afuera, así que la prolijidad importa. Ver `README.md` (EN) y `README.es.md` (ES).

## Arquitectura (Clean Architecture con Inversify)
- Flujo: `routes/` → `controllers/` → `usecases/` (detrás de `interfaces/`) → `repositories/` (Mongoose) y `services/` (Publisher/Consumer de RabbitMQ, Database).
- La subida (`uploadFileUseCase`) genera un job ID, responde enseguida y publica en RabbitMQ; `processFileUseCase` consume y procesa por lotes, guardando resultados y errores (`JobError`) de forma incremental.
- Las dependencias se inyectan con Inversify (`reflect-metadata`). Los use cases dependen de interfaces, nunca de implementaciones concretas ni de Express/Mongoose.
- Auth por JWT (`middleware/auth.ts`, `utils/authUtils.ts`).

## Comandos
```bash
docker compose up -d   # Mongo + RabbitMQ (lee .env)
yarn dev               # tsc --watch + nodemon
yarn build && yarn start
yarn test              # jest (ts-jest), tests en src/tests/*.test.ts
```
Usar **yarn** (hay `yarn.lock`), no npm.

## Reglas
- `.env` tiene credenciales: no leerlo ni imprimirlo; usar `.env.sample` como referencia. Cada variable nueva va también en `.env.sample` (vacía).
- Si se toca un README, mantener sincronizados `README.md` y `README.es.md`.
- Controllers finos: validan y formatean; la lógica va en use cases. Todo use case nuevo tiene interfaz en `interfaces/` y test con mocks (`@jest-mock/express`, supertest para rutas).
- Antes de dar algo por terminado: `yarn build && yarn test`.
