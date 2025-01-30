export interface EmailService {
  send(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>,
  ): Promise<void>;
}
