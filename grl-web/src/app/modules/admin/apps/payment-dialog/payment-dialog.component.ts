import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  selectedMethod: string = 'zalopay';
  qrCodeUrl: string = '';
  bankAccounts = [
    {
      bank: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'CONG TY TNHH GREENLINE',
      branch: 'Chi nhánh Hà Nội'
    },
    {
      bank: 'Techcombank',
      accountNumber: '0987654321',
      accountName: 'CONG TY TNHH GREENLINE',
      branch: 'Chi nhánh Hà Nội'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      amount: [data.amount, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  ngOnInit(): void {
    this.generateQRCode();
  }

  onMethodChange(method: string): void {
    this.selectedMethod = method;
    this.generateQRCode();
  }

  generateQRCode(): void {
    // In a real application, you would call your backend API to generate QR code
    // For demo purposes, we'll use a placeholder QR code
    const amount = this.paymentForm.get('amount')?.value;
    const description = this.paymentForm.get('description')?.value;
    
    if (this.selectedMethod === 'zalopay') {
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=zalopay://payment?amount=${amount}&description=${description}`;
    } else if (this.selectedMethod === 'momo') {
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=momo://payment?amount=${amount}&description=${description}`;
    }
  }

  async submitPayment(): Promise<void> {
    if (this.paymentForm.valid) {
      try {
        // In a real application, you would call your backend API to process the payment
        const paymentData = {
          ...this.paymentForm.value,
          paymentMethod: this.selectedMethod,
          orderId: this.generateOrderId()
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Close dialog and navigate to thank you page
        this.dialogRef.close();
        this.router.navigate(['/thank-you'], { 
          state: { 
            paymentData,
            invoiceNumber: this.generateInvoiceNumber()
          }
        });
      } catch (error) {
        console.error('Payment error:', error);
        // Handle error appropriately
      }
    }
  }

  private generateOrderId(): string {
    return 'ORD' + Date.now().toString().slice(-8);
  }

  private generateInvoiceNumber(): string {
    return 'INV' + Date.now().toString().slice(-8);
  }

  close(): void {
    this.dialogRef.close();
  }
} 