# MagmaMath

A microservices-based application built with NestJS, featuring user management and notification services.

## Architecture

This project consists of multiple microservices communicating through RabbitMQ:

- **User Microservice** - Handles user CRUD operations (Port 3000)
- **Notification Microservice** - Manages notifications (Port 3001)
- **MongoDB** - Database for data persistence (Port 27017)
- **RabbitMQ** - Message broker for inter-service communication (Port 5672)

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher

## Getting Started

1. Install dependencies and build the user microservice
2. Install dependencies and build the notification microservice
3. Run the following command from the project root:
   ```bash
   docker-compose up --build
   ```

> **Note**: All environment variables are configured in the docker-compose setup for simplicity.

## API Documentation

### User Management Endpoints

#### Create User

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "jan",
  "email": "jan@gmail.com"
}
```

#### Get User

```http
GET http://localhost:3000/users/:user-id
```

#### Get Many Users

```http
GET http://localhost:3000/users?page=1
```

#### Update User

```http
PATCH http://localhost:3000/users/:user-id
Content-Type: application/json

{
  "name": "jan_updated",
  "email": "janupdated@gmail.com"
}
```

#### Delete User

```http
DELETE http://localhost:3000/users/:user-id
```

### Error Scenarios for Testing

You can test various error scenarios:

- Retrieve a user that doesn't exist
- Create a user with an email that's already in use
- Update user data with an email that belongs to another user
- Delete a non-existing user

## Configuration

### MongoDB

- **Root User**: `admin`
- **Root Password**: `password123`
- **Database**: `magmamath`
- **Connection URI**: `mongodb://admin:password123@mongodb:27017/magmamath?authSource=admin`

### RabbitMQ

- **Username**: `admin`
- **Password**: `password123`
- **Connection URL**: `amqp://admin:password123@rabbitmq:5672`
- **Management UI**: http://localhost:15672

#### Accessing RabbitMQ Management Console

1. Open your browser and navigate to: http://localhost:15672
2. Login with:
   - Username: `admin`
   - Password: `password123`
