import { Component, OnInit, ViewChild } from '@angular/core';
import { DashBoardService } from 'app/shared/services/dash-board.services';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
    @ViewChild('contactDialog') contactDialog: any;
    
    visibleCards: any[] = [];
    data: any[] = [];
    selectedPricing: any = null;
    dialogRef: any;

    constructor(
        private DashBoardServices: DashBoardService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.fetch();
    }

    fetch() {
        this.DashBoardServices.getSheetData('pricing').subscribe(rs => {
            this.data = rs;
            // Initialize visible cards after data is loaded
            this.visibleCards = this.data.slice(1); // Skip the header row
        });
    }

    openContactDialog(pricing: any): void {
        this.selectedPricing = pricing;
        this.dialogRef = this.dialog.open(this.contactDialog, {
            data: pricing,
            width: '90%',
            maxWidth: '600px',
            panelClass: 'contact-dialog'
        });
    }

    closeContactDialog(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    onContactSubmit(formData: any): void {
        // Handle form submission
        console.log('Form submitted:', formData);
        this.closeContactDialog();
    }
}
