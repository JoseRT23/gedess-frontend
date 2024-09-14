
# Gedess frontend

Proyecto desarrollado con la versión 17.3.8. de Angular, para el grupo de estudio GEDESS (Grupo de estudio de soluciones de software).

```bash
├── README.md
├── src
|  └── app
|     └── auth: En esta carpeta se encuentra todo lo referente al modulo de autenticación
|     └── components/chart: En esta carpeta esta el componente de la grafica que se usa en 
|                           la aplicación
|     └── pages: En esta carpeta estan lo referente a la pagina de dashboard y historico
|     └── services: En esta carpeta estan los servicios que se conectan con la API
|     └── shared: En esta carpeta estan piezas de código que se usan en toda la aplicación
|     └── app.component.css
|     └── app.component.html
|     └── app.component.ts
|     └── app.config.ts: Punto de inicio de la aplicación
|     └── app.routes.ts: En este archivo esta la configuración de las rutas de la app
|  └── assets
└── 
```

## Instalación

Instalar gedess-frontend com [npm](https://www.npmjs.com/) de la siguiente manera,
se debe tener el [CLI](https://v17.angular.io/cli) de Angular instalado.

```bash
  - Clonar proyecto
    git clone https://github.com/JoseRT23/gedess-frontend.git
  
  - Ingresar a la carpeta
    cd gedess-frontend

  - Instalar dependencias
    npm install ó npm install --force 
```

## Ejecución

Para ejecutar el proyecto se puede realizar con cualquiera de los siguientes comandos.

```bash
    ng s -o

    npm start
```

Luego de ejecutarlos el proyecto estará corriendo en la siguiente url: http://localhost:4200
## Características

- SocketIO para comunicación en tiempo real.
- Gráficas de ngx-charts.
- Diseño responsivo.


