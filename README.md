# ExcelLoaderService

Servicio de carga de planillas de cálculo Excel con validación de formato y notificación de procesamiento.

## Descripción

Este proyecto está desarrollado utilizando **Node.js**, **Express**, **TypeScript**, **RabbitMQ** y **MongoDB**. Proporciona un servicio que permite la carga y procesamiento de archivos Excel 
mediante solicitudes HTTP, siguiendo la arquitectura **RESTful API**. 

El proceso comienza cuando el usuario envía una planilla Excel junto con un esquema que define el formato de los datos a procesar a través de un endpoint HTTP. Para evitar la sobrecarga y el bloqueo de la interfaz HTTP durante el procesamiento de archivos, lo cual varía en tiempo según su tamaño, se recurre a **RabbitMQ** como gestor de mensajes. Esto permite gestionar las peticiones de manera asincrónica, utilizando colas para procesar los archivos sin afectar la experiencia del usuario.

Una vez que las peticiones son encoladas, son procesadas en lotes. El resultado del procesamiento se guarda de forma incremental en **MongoDB**, asegurando que los datos sean persistidos correctamente a medida que se completan los lotes.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework web minimalista para Node.js.
- **TypeScript**: Superset de JavaScript que agrega tipado estático.
- **MongoDB**: Base de datos NoSQL para almacenar datos.
- **RabbitMQ**: Sistema de mensajería para comunicación asincrónica.

## Arquitectura

![Arquitectura del servicio, siguiendo las reglas de Clean Architecture](/docs/architecture.png)

Este sistema está construido utilizando Node.js con Express y TypeScript. La arquitectura sigue el patrón de Clean Architecture, que promueve un código modular, desacoplado y fácil de mantener. A continuación, se describe cómo se estructura el sistema y cómo interactúan sus componentes principales.

### 1. API REST

El sistema proporciona una API REST que actúa como punto de entrada para interactuar con los diferentes servicios y funcionalidades del sistema. Esta API está construida sobre Express, y cada ruta de la API está gestionada por un Controller.

### 2. Controllers

Los Controllers son responsables de recibir las solicitudes de los clientes y delegar la lógica de negocio a los Use Cases. Cada controlador está asociado a una ruta de la API y maneja la validación y el formato de los datos de entrada y salida. Los controladores se comunican con los Use Cases a través de interfaces, lo que permite un desacoplamiento entre la lógica de presentación y la lógica de negocio.

### 3. Use Cases

Los Use Cases representan las operaciones de negocio de la aplicación y contienen la lógica de procesamiento principal. Cada Use Case es independiente y desacoplado gracias a las interfaces que definen su comportamiento. Esto permite que los casos de uso sean fácilmente intercambiables o probados sin necesidad de depender de implementaciones específicas.

Uno de los casos de uso importantes es el de Carga de Archivos. Su procedimiento comprende los siguientes pasos:

  - El usuario envía una solicitud para cargar un archivo.
  - El Controller recibe la solicitud y delega la operación al Use Case correspondiente.
  - El Use Case de carga genera un identificador único para el proceso de carga y retorna inmediatamente este ID al cliente.
  - Posteriormente, el Use Case envía un mensaje a RabbitMQ (como Message Broker) para encolar el nuevo proceso de carga.
  - Cuando llega su turno, RabbitMQ invoca el Use Case de procesamiento de archivos para continuar con dicha tarea. De esta manera se evita el bloqueo de la interfaz HTTP y se gestiona el procesamiento de manera asincrónica.

### 4. Message Broker (RabbitMQ)

RabbitMQ actúa como un Message Broker en el sistema. La comunicación asincrónica a través de RabbitMQ permite una arquitectura más escalable y flexible.

### 5. Repositories

El acceso a la base de datos y el almacenamiento de las entidades se realiza a través de repositorios. Los repositorios son responsables de manejar la persistencia de las entidades en las diferentes bases de datos, en este caso, MongoDB. Este patrón asegura que la lógica de negocio y el acceso a servicios externos estén desacoplados. Cabe destacar que los repositorios implementados utilizan el ORM Mongoose para un manejo simplificado de las collecciones y schemas en MongoDB.

#### MongoDB

El sistema utiliza MongoDB para almacenar los procesos de carga de archivos y los archivos procesados. La implementación del repositorio que maneja MongoDB es independiente y puede ser fácilmente intercambiada por otro sistema de almacenamiento sin afectar la lógica de negocio.

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
declarada dentro del mismo archivo. Es posible utilizar los tokens para poner a prueba los endpoints permisionados, agregando uno de ellos al campo de cabecera ```Authorization```.
Además, en la carpeta ```examples``` se encuentran ejemplos de archivos Excel para cargar.

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
        "message": "File uploaded successfully",
        "job_id": "12345"
      }
      ```
- **Código 400: Solicitud incorrecta**

    - Descripción: Si falta algún parámetro requerido (file_content o file_schema), se devolverá un error con el mensaje correspondiente.
    - Cuerpo de la respuesta:
      ```json
      {
        "message": "Please upload an Excel file/Please upload a file schema"
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

    - Descripción: Si la solicitud es procesada correctamente, se devolverán los datos del estado del trabajo en formato JSON, con los errores paginados.
    - Cuerpo de la respuesta:
      ```json
      {
        "id": "12345",
        "status": "done",
        "collection_name": "file.xlsx",
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
      
### Unit testing

Es posible ejecutar los tests de unidad ubicados en ```src/tests/``` mediante el siguiente comando:

```bash
yarn test
```

## Contacto 

- Email: facundomiglierini@gmail.com
- LinkedIn: https://ar.linkedin.com/in/facundomiglierini
- GitHub: @FacundoMiglierini

