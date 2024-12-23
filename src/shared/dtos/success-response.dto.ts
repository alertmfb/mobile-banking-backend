export class SuccessResponseDto {
  private message: string;
  private data: string;
  private status: string;

  constructor(message: string, data: any = null) {
    this.status = 'success';
    this.message = message;
    this.data = data;
  }
}
