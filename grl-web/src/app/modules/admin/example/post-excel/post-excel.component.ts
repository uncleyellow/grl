import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'environments/environment.prod';
import Swal from 'sweetalert2';
import { DialogComponent } from './dialog/dialog.component';

interface SheetData {
  id?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-post-excel',
  templateUrl: './post-excel.component.html',
  styleUrls: ['./post-excel.component.scss']
})
export class PostExcelComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<SheetData>([]);
  form!: FormGroup;
  loading = false;
  selectedSheet = 'contact';
  sheets = [
    { value: 'contact', label: 'Contact' },
    { value: 'contact_customer', label: 'Customer Contact' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'solutions', label: 'Solutions' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'news', label: 'News' },
    { value: 'welcome-eng', label: 'Welcome (ENG)' },
    { value: 'pricing-eng', label: 'Pricing (ENG)' },
    { value: 'solutions-eng', label: 'Solutions (ENG)' },
    { value: 'dashboard-eng', label: 'Dashboard (ENG)' },
    { value: 'news-eng', label: 'News (ENG)' }
  ];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.displayedColumns = [];
    const endpoint = this.selectedSheet;
    const headers = new HttpHeaders(environment.api.headers);

    this.http.get(`${environment.api.url}/${endpoint}`, {headers}).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.displayedColumns = Object.keys(data[0]).filter(key => key !== 'id');
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else {
          this.displayedColumns = [];
          this.dataSource = new MatTableDataSource([]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.displayedColumns = [];
        this.dataSource = new MatTableDataSource([]);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load data'
        });
      }
    });
  }

  onSheetChange() {
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDialog() {
    const fieldsForSheet: { [key: string]: string[] } = {
      contact: ['fullName', 'email', 'message'],
      contact_customer: ['fullName', 'email', 'kind', 'number', 'message'],
      welcome: ['shortContent', 'title'],
      pricing: ['content', 'kind', 'money', 'notes'],
      solutions: ['content', 'kind'],
      dashboard: ['container', 'customer', 'client', 'rent', 'support'],
      news: ['imageUrl', 'title', 'shortContent', 'fullContent'],
      'welcome-eng': ['shortContent', 'title'],
      'pricing-eng': ['content', 'kind', 'money', 'notes'],
      'solutions-eng': ['content', 'kind'],
      'dashboard-eng': ['container', 'customer', 'client', 'rent', 'support'],
      'news-eng': ['imageUrl', 'title', 'shortContent', 'fullContent'],
    };

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        fields: fieldsForSheet[this.selectedSheet],
        sheet: this.selectedSheet,
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditDialog(row: SheetData) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        ...row,
        sheet: this.selectedSheet,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteRecord(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const endpoint = this.selectedSheet;
        const headers = new HttpHeaders(environment.api.headers);

        this.http.delete(`${environment.api.url}/${endpoint}/${id}`, {headers}).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Record has been deleted.', 'success');
            this.loadData();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error!', 'Failed to delete record.', 'error');
          }
        });
      }
    });
  }
}
