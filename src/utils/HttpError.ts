export class HttpError extends Error {
  constructor(public message: string, status: number) {
    super(message);
  }
}
