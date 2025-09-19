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
GET http://localhost:3000/users?page=3&limit=2
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

## Important Notes

### Event-Driven Architecture Considerations

In a production microservices environment, there should be a **separate broker package** containing all event interfaces, topics, and messaging contracts that can be shared across microservices. This package would serve as a single source of truth for inter-service communication definitions.

#### Ideal Architecture Pattern

**Broker Package Structure:**

```
@company/messaging-contracts/
├── user/
│   ├── events/
│   │   ├── user-created.event.ts
│   │   ├── user-updated.event.ts
│   │   └── user-deleted.event.ts
│   └── topics/
│       └── user.topics.ts
└── index.ts
```

#### Implementation Across Microservices

**User Microservice (Publisher):**

```typescript
import { UserCreatedEvent } from '@company/messaging-contracts/user/events/user-created.event';
import { USER_TOPICS } from '@company/messaging-contracts/user/topics/user.topics';

// In user service
async createUser(userData: CreateUserDto): Promise<User> {
  const user = await this.repository.save(userData);

  // Publish event with strongly typed payload
  const event: UserCreatedEvent = {
    userId: user.id,
    email: user.email,
    name: user.name,
    correlationId: context.correlationId,
  };

  await this.messagingService.publish(USER_TOPICS.USER_CREATED, event);
  return user;
}
```

**Notification Microservice (Consumer):**

```typescript
import { UserCreatedEvent } from '@company/messaging-contracts/user/events/user-created.event';
import { USER_TOPICS } from '@company/messaging-contracts/user/topics/user.topics';

// In notification controller
@MessagePattern(USER_TOPICS.USER_CREATED)
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  // Type-safe event handling
  await this.notificationService.sendWelcomeEmail({
    userId: event.userId,
    email: event.email,
    name: event.name,
  });
}
```

#### Why It's Not Implemented Here

This pattern was **deliberately omitted** from this exercise because it would require additional package management, publishing, and dependency resolution or workarounds like manually using yalc

#### To implement this pattern:

1. Create a new npm package (e.g., `@magmamath/messaging-contracts`)
2. Move all event interfaces and topic definitions to this package
3. Publish the package to a registry (npm, private registry)
4. Update each microservice to import from the shared package
