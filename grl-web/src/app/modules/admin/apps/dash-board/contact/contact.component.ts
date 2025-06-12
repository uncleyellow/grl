import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { environment } from 'environments/environment.prod';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeLang: string = 'en';
  @Input() selectedService: string = '';
  @Input() data: string = '';
  @Input() selectedContainer: string = '';
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  isDialog = false
  contactForm!: FormGroup;
  loading = false;

  kinds = [
    { value: 'Cont 20', label: 'Cont 20' },
    { value: 'Cont 25', label: 'Cont 25' },
    { value: 'Cont 40', label: 'Cont 40' },
    { value: 'Cont 45', label: 'Cont 45' },
    { value: 'Cont R', label: 'Cont R' },
    { value: 'Cont L', label: 'Cont L' }
  ];

  services = [
    { value: 'Hà Nội - Nha Trang', label: 'Hà Nội - Nha Trang' },
    { value: 'Hà Nội - Đà Nẵng', label: 'Hà Nội - Đà Nẵng' },
    { value: 'Hà Nội  - Trảng Bom', label: 'Hà Nội  - Trảng Bom' },
    { value: 'Hà Nội - Diêu Trì', label: 'Hà Nội - Diêu Trì' },
    { value: 'Hà Nội - Trung Quốc', label: 'Hà Nội - Trung Quốc' },
    { value: 'Hà Nội - Sài Gòn', label: 'Hà Nội - Sài Gòn' }
  ];

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient
  ) {}

  ngOnInit() {
    if(this.selectedService){
      this.isDialog = true
    }
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      email: ['', [Validators.required, Validators.email]],
      services: [this.selectedService, Validators.required],
      kind: [this.selectedContainer, Validators.required],
      number: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      message: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedService'] || changes['selectedContainer']) {
      this.updateFormValues();
    }
    if (changes['activeLang']) {
      const currentLang = changes['activeLang'].currentValue;
      const previousLang = changes['activeLang'].previousValue;
      
      if (currentLang !== previousLang) {
        this.onLanguageChange(currentLang);
      }
    }
  }

  updateFormValues() {
    if (this.contactForm) {
      // this.isDialog = true
      this.contactForm.patchValue({
        services: this.selectedService,
        kind: this.selectedContainer
      });
    }
  }

  ngOnDestroy() {}

  onLanguageChange(newLang: string) {
    // This function will be called whenever the language changes
    console.log('Language changed to:', newLang);
    // Add your language change logic here
    if(newLang = 'tr'){
      
    }
    else{
      
    }
  }

  handleSubmit() {
    if (this.contactForm.invalid) return;
  
    this.loading = true;
    const formData = {
      ...this.contactForm.value
    };
    debugger
    this.http.post(`${environment.api.url}/contact_customer`, formData).subscribe({
      next: (res) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Gửi thành công!",
          showConfirmButton: false,
          timer: 1500
        });
        this.contactForm.reset();
        this.loading = false;
        this.onSubmit.emit(formData);
      },
      error: (err) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Có lỗi xảy ra!",
          showConfirmButton: false,
          timer: 1500
        });
        console.error(err);
        this.loading = false;
      },
    });
  }

  handleCancel() {
    this.onCancel.emit();
  }
}
