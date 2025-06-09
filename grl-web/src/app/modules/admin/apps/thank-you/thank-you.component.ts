import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
//   styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {
  paymentData: any;
  invoiceNumber: string;
  window = window;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.paymentData = navigation.extras.state['paymentData'];
      this.invoiceNumber = navigation.extras.state['invoiceNumber'];
    } else {
      // Redirect to home if no payment data
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // Print invoice automatically
    setTimeout(() => {
      window.print();
    }, 1000);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
} 