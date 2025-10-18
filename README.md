# Gestión de Clientes

Aplicación fullstack construida con Next.js 13 (App Router) que expone una API REST para gestionar clientes y un panel web para interactuar con el CRUD completo.

## Requerimientos cubiertos

- **Backend**: rutas API (`/api/clientes`) con operaciones `GET`, `POST`, `PUT`, `DELETE` que validan los datos de acuerdo con la estructura SQL proporcionada.
- **Frontend**: interfaz React con formulario para crear y editar clientes, listado con acciones de actualización y eliminación, manejo de estados de carga y mensajes de error/éxito.
- **Datos**: almacenamiento en memoria que persiste mientras el proceso de Next.js sigue activo, con un par de registros semilla para fines de demostración.

## Scripts disponibles

```bash
npm install       # instala dependencias
npm run dev       # inicia la aplicación en modo desarrollo
npm run build     # genera la versión de producción
npm start         # levanta la app compilada
npm run lint      # ejecuta ESLint con la configuración de Next.js
```

La aplicación estará disponible en `http://localhost:3000` y los endpoints públicos bajo `http://localhost:3000/api/clientes`.
