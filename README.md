# HungryUp Frontend

Sistema de gestión para restaurantes — interfaz web construida con Angular 22 y conectada a la API REST de HungryUp.

## Descripción

HungryUp Frontend es la capa de presentación del sistema HungryUp, diseñada para cubrir los flujos operativos de un restaurante moderno: toma de pedidos rápida (FastFood), gestión de mesas (Gourmet), seguimiento en cocina y administración del catálogo.

## Características

- **POS FastFood** — toma de pedidos por categoría con ticket en tiempo real y creación directa en backend
- **POS Gourmet** — mapa de mesas con estado live, comandas abiertas, envío a cocina y cobro integrado
- **Order Monitor** — tablero Kanban (Nuevo → En Preparación → Entregado) para seguimiento en cocina
- **Admin** — catálogo de productos y categorías; panel de usuarios

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 22 (Standalone Components) |
| Estado | Angular Signals + `computed()` |
| Estilos | SCSS + Tailwind CSS v4 |
| HTTP | `HttpClient` + `forkJoin` (RxJS) |
| Tipografía | Plus Jakarta Sans |
| Build | Angular CLI 22 |

## Requisitos previos

- Node.js 20+
- Angular CLI 22 (`npm install -g @angular/cli`)
- Backend HungryUp corriendo en `http://localhost:5216`

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (requiere backend activo)
ng serve

# Abrir en http://localhost:4200
```

## Proxy de desarrollo

Las llamadas a `/api/*` se redirigen automáticamente al backend a través de `proxy.conf.json`:

```
http://localhost:4200/api  →  http://localhost:5216/api
```

## Estructura del proyecto

```
src/app/
├── core/
│   ├── components/     # Componentes globales (bottom-nav)
│   ├── guards/         # Auth guard
│   └── services/       # catalog, table, order, auth, user
├── features/
│   ├── auth/           # Login
│   ├── pos-fastfood/   # POS para pedidos rápidos
│   ├── pos-gourmet/    # POS con gestión de mesas
│   ├── order-monitor/  # Kanban de cocina
│   └── admin/          # Catálogo y usuarios
└── shared/
    └── models/         # DTOs alineados con la API (.NET)
```

## API

El frontend consume la API REST de HungryUp Backend (.NET 9, SQLite):

| Endpoint | Uso |
|---|---|
| `POST /api/auth/login` | Autenticación |
| `GET /api/v1/categories` | Categorías del menú |
| `GET /api/v1/products` | Productos activos |
| `POST /api/v1/products` | Crear producto |
| `GET /api/v1/orders` | Pedidos (filtrable por `estadoPrep`) |
| `GET /api/v1/orders/mesas` | Estado de mesas |
| `POST /api/v1/orders` | Crear pedido |
| `PUT /api/v1/orders/{id}/status` | Actualizar estado de preparación |
| `POST /api/v1/billing/pay` | Procesar pago y liberar mesa |

## Licencia

MIT
