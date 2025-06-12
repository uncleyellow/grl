import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2'
import { environment } from 'environments/environment.prod'; // Nếu file cách xa

@Component({
  selector: 'app-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss']
})
export class ContactUsFormComponent {

contactForm!: FormGroup;
loading = false;

constructor(
  @Inject(MAT_DIALOG_DATA) public data: any, // Nhận dữ liệu từ cha
  private dialogRef: MatDialogRef<ContactUsFormComponent>, // Đảm bảo có dòng này
  private fb: FormBuilder, 
  private http: HttpClient
){

}
ngOnInit() {
  this.contactForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });
}
onSubmit() {
  debugger
  if (this.contactForm.invalid) return;

  this.loading = true;
  const formData = {
    id: crypto.randomUUID(), // Tạo GUID trên frontend
    ...this.contactForm.value,
    createdAt: new Date().toISOString(),
  };
  this.http.post(`${environment.api.url}/contact`, formData).subscribe({
    next: (res) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
      });
      this.contactForm.reset();
      this.loading = false;
    },
    error: (err) => {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Something went wrong!",
        showConfirmButton: false,
        timer: 1500
      });
      console.error(err);
      this.loading = false;
    },
  });
}


onCancel(): void {
  this.dialogRef.close(); // Đóng dialog mà không trả dữ liệu
}
}
