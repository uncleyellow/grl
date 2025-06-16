import { Component, OnInit } from '@angular/core';
import { DashBoardService } from 'app/shared/services/dash-board.services';
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-introduce',
  templateUrl: './introduce.component.html',
  styleUrls: ['./introduce.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntroduceComponent implements OnInit {
  data
  dataDashBoard
  showFullDescriptionWhoWeAre: boolean = false;
  showFullDescriptionOurMission: boolean = false;

  constructor(
    private DashBoardServices: DashBoardService,
  ) {

  }

  ngOnInit(): void {
    this.fetch()
    this.fetchDashBoard()
  }

  fetch() {
    this.DashBoardServices.getSheetData('welcome').subscribe(rs => {
      this.data = rs;
    })
  }

  fetchDashBoard() {
    this.DashBoardServices.getSheetData('dashboard').subscribe(rs => {
      this.dataDashBoard = rs;
      console.log(this.dataDashBoard)
    })
  }

  toggleWhoWeAreDescription(): void {
    this.showFullDescriptionWhoWeAre = !this.showFullDescriptionWhoWeAre;
  }

  toggleOurMissionDescription(): void {
    this.showFullDescriptionOurMission = !this.showFullDescriptionOurMission;
  }
}
