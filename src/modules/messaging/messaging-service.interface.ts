export interface MessagingService {
  sendSms(message: string, to: string): Promise<any>;
  sendBulkSms(message: string, to: string[]): Promise<any>;
  sendWhatsapp(message: string, to: string): Promise<any>;
  sendSmsToken?(payload: any): Promise<any>;
  sendEmailToken?(payload: any): Promise<any>;
  verifyToken?(payload: any): Promise<any>;
}
