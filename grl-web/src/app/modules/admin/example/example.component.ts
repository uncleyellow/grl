import { Component, ViewEncapsulation } from '@angular/core';
import { DashBoardService } from 'app/shared/services/dash-board.services';

@Component({
    selector     : 'example',
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ExampleComponent
{

    data
    id
    /**
     * Constructor
     */
    constructor(
      private DashBoardServices:DashBoardService, 
        
    )
    {
    }
    ngOnInit(): void {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
      this.fetch()
    }

    fetch(){
      // this.DashBoardServices.getSheetData(this.id).subscribe(rs=>{
      //   this.data = rs
      // })
    }
  
}
