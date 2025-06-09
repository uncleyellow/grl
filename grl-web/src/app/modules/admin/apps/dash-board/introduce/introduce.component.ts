import { Component, OnInit } from '@angular/core';
import { DashBoardService } from 'app/shared/services/dash-board.services';

@Component({
  selector: 'app-introduce',
  templateUrl: './introduce.component.html',
  styleUrls: ['./introduce.component.scss']
})
export class IntroduceComponent implements OnInit{
  data
  dataDashBoard
  constructor(
    private DashBoardServices:DashBoardService,
  )
  {
    
  }
  ngOnInit(): void {
    this.fetch()
    this.fetchDashBoard()
  }

  fetch(){
    this.DashBoardServices.getSheetData('welcome').subscribe(rs=>{
      this.data = rs;
    })
  }
  fetchDashBoard(){
    this.DashBoardServices.getSheetData('dashboard').subscribe(rs=>{
      this.dataDashBoard = rs;
      console.log(this.dataDashBoard)
    })
  }
}
