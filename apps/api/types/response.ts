export type MessageResponse = {
  message: string
};

export type ErrorResponse = {
  error: MessageResponse & {
    stack?: string
  }
};