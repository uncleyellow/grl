import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog',
  templateUrl: 'dialog.component.html'
})
export class DialogComponent implements OnInit {
  form!: FormGroup;
  fields: string[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.fields = this.data.fields || Object.keys(this.data).filter(key => key !== 'id' && key !== 'sheet' && key !== 'isEdit');
    const formGroup: any = {};
    this.fields.forEach(field => {
      formGroup[field] = [this.data[field] || '', Validators.required];
    });
    this.form = this.fb.group(formGroup);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const endpoint = this.data.sheet;
    const formData = this.form.value;

    if (this.data.isEdit) {
      // Update existing record
      this.http.put(`${environment.apiUrl}/${endpoint}/${this.data.id}`, formData)
        .subscribe({
          next: () => {
            Swal.fire('Success!', 'Record updated successfully.', 'success');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error!', 'Failed to update record.', 'error');
            this.loading = false;
          }
        });
    } else {
      // Add new record
      this.http.post(`${environment.apiUrl}/${endpoint}`, formData)
        .subscribe({
          next: () => {
            Swal.fire('Success!', 'Record added successfully.', 'success');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error!', 'Failed to add record.', 'error');
            this.loading = false;
          }
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 