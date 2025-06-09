import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DashBoardService } from 'app/shared/services/dash-board.services';

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements OnInit{
  data
  @Input() activeLang: string = 'en';
  constructor(
    private DashBoardServices:DashBoardService,

  ){

  }

  ngOnInit(): void {
    this.fetch()
  }

  fetch(){
    this.DashBoardServices.getSheetData('dm-cont').subscribe(rs=>{
      this.data = rs
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
}
