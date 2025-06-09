import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactUsFormComponent } from '../contact-us-form/contact-us-form.component';

@Component({
  selector: 'app-hire',
  templateUrl: './hire.component.html',
  styleUrls: ['./hire.component.scss']
})
export class HireComponent {
  constructor(
    private dialog: MatDialog
  ){
    
  }
  downloadFile() {
    const fileUrl = 'assets/green-line/Hosoungvienform.doc'; // Đường dẫn file
    const fileName = 'Hosoungvienform.doc'; // Tên file khi tải về
  
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
  
  contactUs(){
    this.dialog.open(ContactUsFormComponent, {
      data: { id: 1, name: "Nguyễn Văn A" },
      width: '400px',
      disableClose: true
    });
  }
}
