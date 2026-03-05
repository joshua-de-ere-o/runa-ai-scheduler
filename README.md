# 🚀 Runa AI Scheduler

**Runa AI Scheduler** es una plataforma avanzada de gestión y programación diseñada para optimizar la administración de clientes potenciales (leads), agendas y métricas de rendimiento en un entorno moderno y eficiente.

Built with **React 18**, **Vite**, **TypeScript**, and **Supabase**.

---

## ✨ Características Principales

- **📥 Bandeja de Entrada (Inbox):** Gestión centralizada de comunicaciones y notificaciones.
- **📅 Agenda Inteligente:** Calendario interactivo para organizar citas y eventos.
- **👤 Gestión de Leads:** Pipeline completo para el seguimiento de prospectos y clientes.
- **📊 Métricas y Analítica:** Dashboards dinámicos con gráficos detallados sobre el rendimiento del negocio.
- **⚡ Rendimiento (Performance):** Herramientas para medir y optimizar la conversión y eficacia.
- **⚙️ Configuración Personalizada:** Panel de ajustes para adaptar la plataforma a tus necesidades.

---

## 🛠️ Stack Tecnológico

- **Frontend:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Estado Asíncrono:** [React Query (@tanstack/react-query)](https://tanstack.com/query/latest)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Backend/Auth:** [Supabase](https://supabase.com/)
- **Testing:** [Vitest](https://vitest.dev/)

---

## 🚀 Comenzando

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) o [bun](https://bun.sh/)

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd runa-ai-scheduler
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configuración de Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:8080` (o el puerto configurado).

---

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Vite.
- `npm run build`: Crea la versión de producción en la carpeta `dist`.
- `npm run lint`: Ejecuta ESLint para analizar el código.
- `npm run test`: Ejecuta las pruebas unitarias con Vitest.
- `npm run preview`: Previsualiza localmente la versión de producción.

---

## 📂 Estructura del Proyecto

```text
src/
├── components/     # Componentes de UI (shadcn) y de negocio.
├── hooks/          # Hooks personalizados de React.
├── integrations/   # Configuración de servicios (Supabase).
├── lib/            # Utilidades y funciones auxiliares.
├── pages/          # Vistas principales de la aplicación.
│   └── dashboard/  # Sub-páginas del panel de control.
└── App.tsx         # Configuración de rutas y proveedores.
```

---

Desarrollado con ❤️ para una gestión de IA eficiente.
