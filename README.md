# Vilches Abogados

**Aplicación web fullstack para un despacho de abogados: autenticación, agenda de citas online, blog legal y panel de administración.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Vercel](https://img.shields.io/badge/Despliegue-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Estado](https://img.shields.io/badge/Estado-Desplegado%20en%20producci%C3%B3n-2ea44f?style=flat-square)](#-estado)

---

## 📌 Descripción

Vilches Abogados es una aplicación web fullstack pensada para un despacho de abogados: los usuarios pueden registrarse y reservar citas online, y el equipo gestiona el contenido (blog de artículos legales y página de equipo) desde un panel de administración.

## 🎓 Estado

- Proyecto web **desplegado en producción** y disponible para cualquier visitante.
- Código abierto en este repositorio con el README y las instrucciones de instalación.

## 🖥️ Demo en vivo

👉 **https://vilches-abogados.vercel.app**

## ✨ Funcionalidades

- **Autenticación:** registro e inicio de sesión de usuarios.
- **Agenda de citas online:** reserva de citas a través de la web.
- **Panel de administración:** área para gestionar el sitio (citas y contenido).
- **Blog de artículos legales:** publicación de artículos.
- **Página de equipo:** presentación de los perfiles del despacho.
- **Diseño responsivo y profesional.**

## 🛠️ Stack

| Capa | Tecnología |
|------|------------|
| Frontend | JavaScript, HTML5, CSS3 |
| Backend | Node.js + Express |
| Base de datos | MySQL |
| Despliegue | Vercel |

## 📂 Estructura

```
index.html          - Página principal
login.html          - Inicio de sesión
register.html       - Registro de usuarios
agendar.html        - Agendar cita
mis-citas.html      - Ver mis citas
admin.html          - Panel de administración
equipo.html         - Perfiles del equipo
blog.html           - Artículos
css/                - Estilos
js/                 - Lógica del frontend
backend/            - API REST (Node.js + Express)
```

## 🚀 Cómo ejecutar

Requisitos: [Node.js](https://nodejs.org) con npm y una base de datos **MySQL**.

```bash
# 1) Backend
cd backend
npm install
npm run dev     # desarrollo
npm start       # producción

# 2) Frontend (abrir en navegador)
# index.html, o desplegar en Vercel
```

1. Crea la base de datos MySQL que use el proyecto (consulta el código para ver el nombre y el esquema).
2. Configura la conexión a MySQL (revisa el código y, si el repositorio incluye un fichero `.env`, sus variables).
3. Arranca el servidor con los comandos anteriores y abre la aplicación en el navegador.

## 👥 Autor

**Miguel José (mjotaa)** — [github.com/mjotaa](https://github.com/mjotaa)

## 📄 Licencia

Sin licencia formal añadida todavía. Mientras no exista una licencia, se reservan todos los derechos.
