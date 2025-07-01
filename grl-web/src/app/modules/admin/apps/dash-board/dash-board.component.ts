import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactComponent } from 'app/modules/admin/apps/dash-board/contact/contact.component';
import { DashBoardService } from 'app/shared/services/dash-board.services';

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements OnInit{
  data
  dataDashBoard
  @Input() activeLang: string = 'en';
  showFullDescription: boolean = false;
  constructor(
    private DashBoardServices:DashBoardService,
    private _matDialog: MatDialog
  ){

  }

  ngOnInit(): void {
    this.fetch()
    this.fetchDashBoard() 
  }

  fetch(){
    this.DashBoardServices.getSheetData('dm-cont').subscribe(rs=>{
      this.data = rs
    })
  }

  fetchDashBoard() {
    this.DashBoardServices.getSheetData('dashboard').subscribe(rs => {
      this.dataDashBoard = rs;
      console.log(this.dataDashBoard)
    })
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeLang']) {
      const currentLang = changes['activeLang'].currentValue;
      const previousLang = changes['activeLang'].previousValue;
      
      if (currentLang !== previousLang) {
        this.onLanguageChange(currentLang);
      }
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

  scrollToContent(): void {
    const content = document.querySelector('bg-white');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openContactDialog(): void {
    this._matDialog.open(ContactComponent, {
      width: '1100px',
      panelClass: 'contact-form-dialog',
      data: { isDialog: true }
    });
  }
}
