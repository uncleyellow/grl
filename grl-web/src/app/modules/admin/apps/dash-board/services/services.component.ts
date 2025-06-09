import { Component, OnInit } from '@angular/core';
import { DashBoardService } from 'app/shared/services/dash-board.services';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit{
  // services = [
  //   {
  //     title: 'Vận chuyển ô tô bằng toa xe chuyên dụng',
  //     description: 'Dedicated trucks for large shipments, ensuring fast and direct delivery.',
  //     img: 'assets/green-line/ContainerService/daukeo2.png'
  //   },
  //   {
  //     title: 'Vận chuyển hàng hoá bằng Container',
  //     description: 'Complete logistics management, optimizing supply chains for efficiency.',
  //     img: 'assets/green-line/Overview/Cont.png'
  //   },
  //   {
  //     title: 'Chế tạo đóng mới toa xe',
  //     description: '24/7 availability for urgent deliveries with priority handling and optimized routes.',
  //     img: 'assets/green-line/ContainerService/suachuabaoduong.png'
  //   },
  //   {
  //     title: 'Đại lý vận tải hàng hoá',
  //     description: 'Expert handling of oversized, overweight, and delicate shipments.',
  //     img: 'assets/green-line/Overview/Train.bmp'
  //   },
  //   {
  //     title: 'Giải pháp thân thiện',
  //     description: 'Secure storage with inventory management and cross-docking at strategic locations.',
  //     img: 'assets/green-line/Overview/Train2.bmp'
  //   },
  //   {
  //     title: 'Giảm thiểu khí thải',
  //     description: 'Safe transport for sensitive goods with advanced refrigeration and monitoring.',
  //     img: 'assets/green-line/Overview/Train3.png'
  //   }
  // ];
  services
  constructor(
    private DashBoardServices:DashBoardService,
  ){

  }

  ngOnInit(): void {
    this.fetch()
  }

  fetch(){
    this.DashBoardServices.getSheetData('solutions').subscribe(rs=>{
      this.services = rs;
      console.log(this.services)
    })
  }
}
