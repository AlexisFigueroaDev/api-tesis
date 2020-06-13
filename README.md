# API backend 

> desarrollo del backend de la aplicacion de administrador de reportes para la gestion de la aplicacion con la base de datos no relacional

_Directorios_

* Config
    * Config.js
* Models
    * Competicion.js
    * Participantes.js
    * Precios.js
    * Profesionales.js
    * Torneo.js
* Routes
    * Index.js
    * Competicion.js
    * Participantes.js
    * Precios.js
    * Profesionales.js
    * Torneo.js    
* Server.js


## Funcionalidades 

> La logica con las reglas de negrocio se muestran en Routes>>Competicion.js

---

1. Carga de Importes
    * Recaudacion de TORNEO 
    * Monto total por CLUB o PROFESIONAL
    * Monto total por PARTICIPANTE


2. ABM 
    * Competicion
    * Participantes
    * Profesionales
    * Torneo 
    * Precio sin tener posibilidad de borrar

3. Login 
    * Login Normal
    * Login Google

4. Archivo de Seguridad
    * Validacion de Token 
    * Validacion de Token con ROL ADMIN
