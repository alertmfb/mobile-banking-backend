import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, Logger } from '@nestjs/common';
import { formatDate } from '../../utils/helpers';
import { BillPaymentProvider } from '../bill-payment/providers/bill-payment.provider.interface';
import { TransactionService } from './transaction.service';
import { BillPaymentService } from '../bill-payment/bill-payment.service';
import { ErrorMessages } from '../../shared/enums/error.message.enum';

@Processor('transactionProcess')
export class TransactionProcess {
  private readonly logger: Logger;

  constructor(
    @Inject('BillPaymentProvider')
    private readonly billService: BillPaymentProvider,
    private readonly transactionService: TransactionService,
    private readonly billPaymentsService: BillPaymentService,
  ) {
    this.logger = new Logger(TransactionProcess.name);
    console.log('Transaction worker initialized!');
  }

  @Process('update-new-balance')
  async handleUpdateNewBalance(job: Job) {
    console.log('Processing update new balance job');
    const { transactionId } = job.data;
    try {
      await this.transactionService.handleTransactionNewBalance(transactionId);
      return;
    } catch (error) {
      // Handle failure (optional: retry mechanism)
      throw new Error(`Update new balance failed: ${error.message}`);
    }
  }

  @Process('buy-airtime')
  async handleBuyAirtime(job: Job) {
    console.log('Processing buy airtime job');
    const { transactionId } = job.data;
    try {
      const transaction = await this.transactionService.findOne(transactionId);
      if (!transaction) {
        throw new Error(ErrorMessages.TRANSACTION_NOT_FOUND);
      }

      const billPayment = await this.billPaymentsService.findOneByTransactionId(
        transaction.id,
      );
      if (!billPayment) {
        throw new Error(ErrorMessages.BILL_PAYMENT_NOT_FOUND);
      }

      // Call third-party API
      const response = await this.billService.buyAirtime({
        transactionId: transaction.id,
        serviceCategoryId: billPayment.productId,
        amount: billPayment.amount,
        phoneNumber: transaction.beneficiary.phoneNumber,
        date: formatDate(transaction.createdAt.toString()),
      });

      // Update transaction status
      await this.billPaymentsService.update(billPayment.id, {
        status: 'SUCCESS',
        reference: response.tranxReference,
        confirmCode: response.confirmCode,
      });

      //update balance
      await this.transactionService.handleTransactionNewBalance(transaction.id);

      return;
    } catch (error) {
      // Handle failure (optional: retry mechanism)
      await this.billPaymentsService.update(transactionId, {
        status: 'FAILED',
        productType: 'AIRTIME',
      });

      console.log('error in buy airitme:', error);
      console.error('error in buy airitme:', error.message);

      throw new Error(`Airtime processing failed: ${error.message}`);
    }
  }

  @Process('buy-internet')
  async handleBuyData(job: Job) {
    console.log('Processing buy data job');
    const { transactionId } = job.data;
    try {
      const transaction = await this.transactionService.findOne(transactionId);
      if (!transaction) {
        throw new Error(ErrorMessages.TRANSACTION_NOT_FOUND);
      }

      const billPayment = await this.billPaymentsService.findOneByTransactionId(
        transaction.id,
      );
      if (!billPayment) {
        throw new Error(ErrorMessages.BILL_PAYMENT_NOT_FOUND);
      }

      // Call third-party API
      const response = await this.billService.buyInternet({
        transactionId: transaction.id,
        serviceCategoryId: billPayment.productId,
        amount: billPayment.amount,
        phoneNumber: transaction.beneficiary.phoneNumber,
        date: formatDate(transaction.createdAt.toString()),
        bundleCode: billPayment.productId,
      });

      // Update transaction status
      await this.billPaymentsService.update(billPayment.id, {
        status: 'SUCCESS',
        reference: response.tranxReference,
        confirmCode: response.confirmCode,
      });

      //update balance
      await this.transactionService.handleTransactionNewBalance(transaction.id);

      return;
    } catch (error) {
      // Handle failure (optional: retry mechanism)
      await this.billPaymentsService.update(transactionId, {
        status: 'FAILED',
        productType: 'DATA',
      });

      console.log('error in buy data:', error);
      console.error('error in buy data:', error.message);

      throw new Error(`Data processing failed: ${error.message}`);
    }
  }

  @Process('buy-electricity')
  async handleBuyElectricity(job: Job) {
    console.log('Processing buy electricity job');
    const { transactionId } = job.data;
    try {
      const transaction = await this.transactionService.findOne(transactionId);
      if (!transaction) {
        throw new Error(ErrorMessages.TRANSACTION_NOT_FOUND);
      }

      const billPayment = await this.billPaymentsService.findOneByTransactionId(
        transaction.id,
      );
      if (!billPayment) {
        throw new Error(ErrorMessages.BILL_PAYMENT_NOT_FOUND);
      }

      // Call third-party API
      const response = await this.billService.buyElectricity({
        vendType: 'PREPAID',
        serviceCategoryId: billPayment.productId,
        amount: billPayment.amount,
        meterNumber: transaction.beneficiary.meterNumber,
        transactionId: transaction.id,
        meterName: transaction.beneficiary.meterName,
        meterAddress: transaction.beneficiary.meterAddress,
      });

      console.log('response:', response);

      // Update transaction status
      await this.billPaymentsService.update(billPayment.id, {
        status: 'SUCCESS',
        token: response.tranxReference,
        confirmCode: response.confirmCode,
      });

      //update balance
      await this.transactionService.handleTransactionNewBalance(transaction.id);

      return;
    } catch (error) {
      // Handle failure (optional: retry mechanism)
      await this.billPaymentsService.update(transactionId, {
        status: 'FAILED',
        productType: 'ELECTRICITY',
      });

      console.log('error in buy electricity:', error);
      console.error('error in buy electricity:', error.message);

      throw new Error(`Electricity processing failed: ${error.message}`);
    }
  }

  @Process('buy-cable-tv')
  async handleBuyCableTv(job: Job) {
    console.log('Processing buy cable tv job');
    const { transactionId } = job.data;
    try {
      const transaction = await this.transactionService.findOne(transactionId);
      if (!transaction) {
        throw new Error(ErrorMessages.TRANSACTION_NOT_FOUND);
      }

      const billPayment = await this.billPaymentsService.findOneByTransactionId(
        transaction.id,
      );
      if (!billPayment) {
        throw new Error(ErrorMessages.BILL_PAYMENT_NOT_FOUND);
      }

      // Call third-party API
      const response = await this.billService.buyCableTv({
        serviceCategoryId: transaction.beneficiary.tvProvider.toLowerCase(),
        bundleCode: billPayment.productId,
        cardNumber: transaction.beneficiary.tvCardNumber,
        customerName: transaction.beneficiary.tvCardName,
        amount: billPayment.amount,
        transactionId: transaction.id,
        invoicePeriod: 1,
      });

      // Update transaction status
      await this.billPaymentsService.update(billPayment.id, {
        status: 'SUCCESS',
        reference: response.tranxReference,
        confirmCode: response.confirmCode,
      });

      //update balance
      await this.transactionService.handleTransactionNewBalance(transaction.id);

      return;
    } catch (error) {
      // Handle failure (optional: retry mechanism)
      await this.billPaymentsService.update(transactionId, {
        status: 'FAILED',
        productType: 'CABLE_TV',
      });

      console.log('error in buy cable tv:', error);
      console.error('error in buy cable tv:', error.message);

      throw new Error(`Cable TV processing failed: ${error.message}`);
    }
  }
}
