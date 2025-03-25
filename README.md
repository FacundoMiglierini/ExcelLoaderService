# ExcelLoaderService

Servicio de carga de planillas de cálculo Excel con validación de formato y notificación de procesamiento.

## Descripción

Este proyecto está construido utilizando **Node.js**, **Express**, **TypeScript**, **RabbitMQ** y **MongoDB**. Proporciona un servicio que permite la carga de planillas Excel 
mediante el manejo de solicitudes HTTP, haciendo uso del protocolo **API REST**. Las planillas son enviadas al servicio junto con un esquema definido por parámetro, el cual establece 
el formato bajo el cual se procesarán los archivos recibidos. Para evitar el bloqueo de la interfaz HTTP durante este procesamiento (cuyo costo es directamente proporcional al tamaño 
del archivo a procesar), se recurre a **RabbitMQ**, un *message broker* que permite la comunicación asincrónica de peticiones gestionadas por medio de una cola. Cuando dichas peticiones 
son atendidas, se resuelven por lotes y la salida resultante se persiste de forma incremental en una base de datos **MongoDB**. 

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework web minimalista para Node.js.
- **TypeScript**: Superset de JavaScript que agrega tipado estático.
- **MongoDB**: Base de datos NoSQL para almacenar datos.
- **RabbitMQ**: Sistema de mensajería para comunicación asincrónica entre aplicaciones.

## Arquitectura

## Herramientas necesarias
- **Yarn**: Versión 1.x.
- **Docker Engine**: Versión 20.10.0 o superior.

## Pasos de instalación

### 1. Clonar el Repositorio

```bash
git clone git@github.com:FacundoMiglierini/ExcelLoaderService.git

# Entrar en el directorio del proyecto
cd ExcelLoaderService
```

### 2. Instalar las dependencias
```bash
yarn install
```

### 3. Iniciar los servicios

```bash
# Asegurarse de tener iniciado el servicio de Docker (omitir si ya está iniciado)
sudo systemctl start docker

# Iniciar los servicios de la base de datos y el message broker usando Docker Compose
docker compose up
```

### 4. Compilar y ejecutar el proyecto

```bash
yarn start
```

## Uso 

**Aclaración**: dado que no se desarrolló un endpoint de login, en el archivo de entorno '.env' se encuentran definidos dos tokens: ```JWT_1``` y ```JWT_2```, generados a partir de la clave secreta ```APP_SECRET```
declarada dentro del mismo archivo. Es posible utilizar los tokens poner a prueba los endpoints permisionados, agregándolos uno de ellos al campo de cabecera ```Authorization```.

Una vez que el servidor está en ejecución, es posible interactuar con él mediante las siguientes rutas:

### POST ```/files``` 

#### Descripción

Este endpoint recibe un archivo Excel y un esquema en formato JSON para procesar la información contenida en el archivo Excel y crear un "job" de carga en el sistema. 
Requiere un token de autenticación en la cabecera de la solicitud.

#### Parámetros 

##### Request Body

- **file_content** (Archivo: ```multipart/form-data```):

  - Tipo: ```File```
  - Descripción: Es el archivo Excel que se va a procesar. Este archivo debe ser enviado como parte de una solicitud de formulario multipart. El archivo se espera en la clave ```file_content``` en el cuerpo de la solicitud.
  - Formato: Excel (XLSX)

- **file_schema** (String: ```application/json```):
  
  - Tipo: ```String```
  - Descripción: Es un objeto JSON que contiene el esquema de los datos que se deben extraer del archivo Excel. El esquema define cómo deben ser interpretados y procesados los datos dentro del archivo Excel. Se espera en la clave ```file_schema``` en el cuerpo de la solicitud.
  - Formato: JSON
 
##### Response 

- **Código 202: Aceptado**

    - Descripción: Si la solicitud es válida y la creación del trabajo de carga es exitosa, el sistema devuelve el ID del trabajo creado.
    - Cuerpo de la respuesta:
      ```json
      {
        "job_id": "12345"
      }
      ```
- **Código 400: Solicitud incorrecta**

    - Descripción: Si falta algún parámetro requerido (file_content o file_schema), se devolverá un error con el mensaje correspondiente.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Missing required fields: file_content and/or file_schema"
      }
      ```
- **Código 500: Error Interno del Servidor**

    - Descripción: Si ocurre un error inesperado en el servidor, se devolverá un mensaje genérico de error interno.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Internal Server Error"
      }
      ```

### GET ```/jobs/:id```

#### Descripción 

Este endpoint se utiliza para obtener el estado de un trabajo de carga (job) específico, identificando el trabajo mediante su ```jobId```. Permite la paginación de los errores de carga, lo que facilita la visualización de grandes cantidades de datos de manera eficiente.
Requiere un token de autenticación en la cabecera de la solicitud.

#### Parámetros

##### Parámetros en la URL

- **id** (Path Parameter):

  - Tipo: ```String```
  - Descripción: El jobId del trabajo que se desea consultar. Este parámetro es obligatorio y debe estar presente en la URL de la solicitud.
  - Ejemplo: ```/jobs/12345```

##### Parámetros en la consulta (query parameters)

- **page**:

  - Tipo: ```Number``` (opcional)
  - Descripción: El número de página de los resultados que se desea obtener. Si no se proporciona, el valor predeterminado será 1.
  - Valor predeterminado: 1
  - Ejemplo: ```?page=2```

- **limit**:

  - Tipo: ```Number``` (opcional)
  - Descripción: El número de resultados por página. Si no se proporciona, el valor predeterminado será 10.
  - Valor predeterminado: 10
  - Ejemplo: ```?limit=20```

##### Response 

- **Código 200: Éxito**

    - Descripción: Si la solicitud es procesada correctamente, se devolverán los datos del estado del trabajo en formato JSON.
    - Cuerpo de la respuesta:
      ```json
      {
        "id": "12345",
        "status": "processing",
        "file_id": "6789",
        "errors": []
      }
      ```
- **Código 400: Parámetros de paginación inválidos**

    - Descripción: Si los parámetros ```page``` o ```limit``` son inválidos (no son números, son menores que 1, etc.), se devolverá un error con el mensaje correspondiente.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Invalid pagination parameters"
      }
      ```
- **Código 404: No encontrado**

    - Descripción: Si no se encuentra el trabajo correspondiente al ```jobId```, se devolverá un error con el mensaje correspondiente.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Job not found"
      }
      ```
- **Código 500: Error Interno del Servidor**

    - Descripción: Si ocurre un error inesperado en el servidor, se devolverá un mensaje genérico de error interno.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Internal Server Error"
      }
      ```
  
### GET ```/files/:id```

#### Descripción 

Este endpoint se utiliza para obtener un archivo específico identificado por su ```fileId```, con soporte para paginación de su contenido procesado. 
Requiere un token de autenticación en la cabecera de la solicitud.

#### Parámetros

##### Parámetros en la URL

- **id** (Path Parameter):

  - Tipo: ```String```
  - Descripción: El fileId del trabajo que se desea consultar. Este parámetro es obligatorio y debe estar presente en la URL de la solicitud.
  - Ejemplo: ```/files/6789```

##### Parámetros en la consulta (query parameters)

- **page**:

  - Tipo: ```Number``` (opcional)
  - Descripción: El número de página de los resultados que se desea obtener. Si no se proporciona, el valor predeterminado será 1.
  - Valor predeterminado: 1
  - Ejemplo: ```?page=2```

- **limit**:

  - Tipo: ```Number``` (opcional)
  - Descripción: El número de resultados por página. Si no se proporciona, el valor predeterminado será 10.
  - Valor predeterminado: 10
  - Ejemplo: ```?limit=20```

##### Response 

- **Código 200: Éxito**

    - Descripción: Si la solicitud es procesada correctamente, se devolverán los detalles del archivo con los datos paginados en formato JSON.
    - Cuerpo de la respuesta:
      ```json
      {
        "id": "6789",
        "job_id": "12345",
        "content": [ {} ]
      }
      ```
- **Código 400: Parámetros de paginación inválidos**

    - Descripción: Si los parámetros ```page``` o ```limit``` son inválidos (no son números, son menores que 1, etc.), se devolverá un error con el mensaje correspondiente.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Invalid pagination parameters"
      }
      ```
- **Código 404: No encontrado**

    - Descripción: Si no se encuentra el trabajo correspondiente al ```jobId```, se devolverá un error con el mensaje correspondiente.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "File not found"
      }
      ```
- **Código 500: Error Interno del Servidor**

    - Descripción: Si ocurre un error inesperado en el servidor, se devolverá un mensaje genérico de error interno.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Internal Server Error"
      }
      ```


## Contacto 

- Email: facundomiglierini@gmail.com
- LinkedIn: https://ar.linkedin.com/in/facundomiglierini
- GitHub: @FacundoMiglierini

