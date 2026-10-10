# ExcelLoaderService

**English** · [Español](README.es.md)

Excel spreadsheet upload service with format validation and processing status tracking.

## Overview

This project is built with **Node.js**, **Express**, **TypeScript**, **RabbitMQ** and **MongoDB**. It exposes a **RESTful API** for uploading and processing Excel files over HTTP.

The flow starts when the user sends an Excel spreadsheet to an HTTP endpoint, together with a schema that defines the format of the data to process. Processing time grows with file size, so to avoid overloading or blocking the HTTP interface, requests are handed off to **RabbitMQ** as a message broker. Requests are handled asynchronously through queues, so files are processed without affecting the user experience.

Once queued, requests are processed in batches. Results are saved incrementally to **MongoDB**, so data is persisted as each batch completes.

## Tech stack

- **Node.js**: server-side JavaScript runtime.
- **Express**: minimalist web framework for Node.js.
- **TypeScript**: JavaScript superset with static typing.
- **MongoDB**: NoSQL database for storing data.
- **RabbitMQ**: message broker for asynchronous communication.

## Architecture

![Service architecture, following Clean Architecture rules](/docs/architecture.png)

The system is built with Node.js, Express and TypeScript and follows Clean Architecture, which promotes modular, decoupled and maintainable code. The main components and how they interact are described below.

### 1. REST API

The REST API is the entry point to the system's services and features. It is built on Express, and each route is handled by a Controller.

### 2. Controllers

Controllers receive client requests and delegate business logic to Use Cases. Each controller is bound to an API route and handles validation and formatting of input and output data. Controllers talk to Use Cases through interfaces, which decouples presentation logic from business logic.

### 3. Use Cases

Use Cases represent the application's business operations and hold the core processing logic. Each Use Case is independent and decoupled through the interfaces that define its behavior, so use cases can be swapped or tested without depending on specific implementations.

One of the key use cases is File Upload. It works as follows:

  - The user sends a request to upload a file.
  - The Controller receives the request and delegates it to the corresponding Use Case.
  - The upload Use Case generates a unique ID for the upload job and returns it to the client immediately.
  - The Use Case then publishes a message to RabbitMQ (the message broker) to enqueue the new upload job.
  - When its turn comes, RabbitMQ triggers the file-processing Use Case to carry on with the job. This keeps the HTTP interface unblocked and processing asynchronous.

### 4. Message broker (RabbitMQ)

RabbitMQ acts as the system's message broker. Asynchronous communication through RabbitMQ makes the architecture more scalable and flexible.

### 5. Repositories

Database access and entity storage go through repositories, which handle persisting entities to the underlying databases — MongoDB in this case. This pattern keeps business logic decoupled from external services. The repositories use the Mongoose ODM to simplify working with MongoDB collections and schemas.

#### MongoDB

The system uses MongoDB to store upload jobs and processed files. The MongoDB repository implementation is self-contained and can be swapped for another storage system without affecting business logic.

## Requirements
- **Yarn**: version 1.x.
- **Docker Engine**: version 20.10.0 or later.

## Installation

### 1. Clone the repository

```bash
git clone git@github.com:FacundoMiglierini/ExcelLoaderService.git

# Enter the project directory
cd ExcelLoaderService
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Start the services

```bash
# Make sure the Docker service is running (skip if it already is)
sudo systemctl start docker

# Start the database and the message broker with Docker Compose
docker compose up
```

### 4. Build and run the project

```bash
yarn start
```

## Usage

**Note**: since there is no login endpoint, the `.env` file defines two tokens, ```JWT_1``` and ```JWT_2```, generated from the ```APP_SECRET``` key declared in the same file. Use either token in the ```Authorization``` header to test the protected endpoints.
The ```examples``` folder contains sample Excel files to upload.

Once the server is running, you can use the following routes:

### POST ```/files```

#### Description

Receives an Excel file and a JSON schema, and creates an upload job that processes the data in the file.
Requires an authentication token in the request header.

#### Parameters

##### Request body

- **file_content** (File: ```multipart/form-data```):

  - Type: ```File```
  - Description: the Excel file to process, sent as part of a multipart form request under the ```file_content``` key.
  - Format: Excel (XLSX)

- **file_schema** (String: ```application/json```):

  - Type: ```String```
  - Description: a JSON object with the schema of the data to extract from the Excel file. It defines how the data in the file is interpreted and processed. Expected under the ```file_schema``` key.
  - Format: JSON

##### Response

- **202 Accepted**

    - Description: if the request is valid and the upload job is created, the system returns the job ID.
    - Response body:
      ```json
      {
        "message": "File uploaded successfully",
        "job_id": "12345"
      }
      ```
- **400 Bad Request**

    - Description: if a required parameter (file_content or file_schema) is missing, an error with the corresponding message is returned.
    - Response body:
      ```json
      {
        "message": "Please upload an Excel file/Please upload a file schema"
      }
      ```
- **500 Internal Server Error**

    - Description: if an unexpected server error occurs, a generic internal error message is returned.
    - Response body:
      ```json
      {
        "message": "Internal Server Error"
      }
      ```

### GET ```/jobs/:id```

#### Description

Returns the status of a specific upload job, identified by its ```jobId```. Upload errors are paginated, which makes large result sets easier to browse.
Requires an authentication token in the request header.

#### Parameters

##### Path parameters

- **id**:

  - Type: ```String```
  - Description: the jobId of the job to query. Required.
  - Example: ```/jobs/12345```

##### Query parameters

- **page**:

  - Type: ```Number``` (optional)
  - Description: the page of results to return.
  - Default: 1
  - Example: ```?page=2```

- **limit**:

  - Type: ```Number``` (optional)
  - Description: the number of results per page.
  - Default: 10
  - Example: ```?limit=20```

##### Response

- **200 OK**

    - Description: if the request succeeds, the job status is returned as JSON, with paginated errors.
    - Response body:
      ```json
      {
        "id": "12345",
        "status": "done",
        "collection_name": "file.xlsx",
        "errors": []
      }
      ```
- **400 Invalid pagination parameters**

    - Description: if ```page``` or ```limit``` is invalid (not a number, less than 1, etc.), an error with the corresponding message is returned.
    - Response body:
      ```json
      {
        "message": "Invalid pagination parameters"
      }
      ```
- **404 Not Found**

    - Description: if no job matches the ```jobId```, an error with the corresponding message is returned.
    - Response body:
      ```json
      {
        "message": "Job not found"
      }
      ```
- **500 Internal Server Error**

    - Description: if an unexpected server error occurs, a generic internal error message is returned.
    - Response body:
      ```json
      {
        "message": "Internal Server Error"
      }
      ```

### Unit testing

Run the unit tests in ```src/tests/``` with:

```bash
yarn test
```

## Contact

- Email: facundomiglierini@gmail.com
- LinkedIn: https://ar.linkedin.com/in/facundomiglierini
- GitHub: @FacundoMiglierini
