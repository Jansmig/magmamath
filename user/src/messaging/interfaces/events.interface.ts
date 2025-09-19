export interface BaseEvent {
  eventId: string;
  payload: Record<string, any>;
}

export interface UserCreatedEvent extends BaseEvent {
  payload: {
    userId: string;
    email: string;
    name: string;
  };
}

export interface UserDeletedEvent extends BaseEvent {
  payload: {
    userId: string;
  };
}
