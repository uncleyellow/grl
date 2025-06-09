import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { ThankYouComponent } from '../thank-you/thank-you.component';

@NgModule({
  declarations: [
    PaymentDialogComponent,
    ThankYouComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  exports: [
    PaymentDialogComponent,
    ThankYouComponent
  ]
})
export class PaymentModule { } 