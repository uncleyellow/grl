import { Component } from '@angular/core';
import { ChartComponent, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexTooltip, ApexLegend, ApexGrid, ApexPlotOptions, ApexTitleSubtitle, ApexStroke, ApexFill, ApexTheme } from "ng-apexcharts";
// export type ChartOptions = {
//   series: any;
//   chart: ApexChart;
//   xaxis: ApexXAxis;
//   yaxis: ApexYAxis;
//   dataLabels: ApexDataLabels;
//   tooltip: ApexTooltip;
//   legend: ApexLegend;
//   grid: ApexGrid;
//   plotOptions: ApexPlotOptions;
//   title: ApexTitleSubtitle;
//   stroke: ApexStroke;
//   fill: ApexFill;
//   theme: ApexTheme;
// };
@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss']
})
export class SolutionsComponent {
  chartOptions1: any;
  chartOptions2: any;

  constructor() {
    this.chartOptions1 = {
      chart: {
        type: "bar",
        height: 350
      },
      title: {
        text: "CO2 Emission Volume (CBU)",
        align: "center",
        style: {
          fontSize: "20px",
          fontWeight: "bold"
        }
      },
      xaxis: {
        categories: ["Railway", "Truck", "Trailer"]
      },
      yaxis: {
        title: { text: "Emission Volume (kg)" }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%"
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "16px", // Chữ to
          colors: ["#000000"] // Màu đen
        },
        formatter: function (val: any) {
          return val + " kg"; // Hiển thị đơn vị kg
        },
        offsetY: 50 // Dịch chữ lên trên
      },
      series: [
        {
          name: "Emission per Truck",
          data: [359, 983, 1789],
          color: "#775DD0"
        },
        {
          name: "Emission per CBU",
          data: [59, 491, 295],
          color: "#FF4560"
        }
      ]
    };

    this.chartOptions2 = {
      chart: {
        type: "bar",
        height: 350
      },
      title: {
        text: "CO2 Emission Volume (40'Cont)",
        align: "center",
        style: {
          fontSize: "20px",
          fontWeight: "bold"
        }
      },
      xaxis: {
        categories: ["Railway", "Trailer"]
      },
      yaxis: {
        title: { text: "Emission Volume (kg)" }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%"
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "16px",
          colors: ["#000000"]
        },
        formatter: function (val: any) {
          return val + " kg";
        },
        offsetY: 50
      },
      series: [
        {
          name: "Emission Volume",
          data: [390, 1789],
          color: "#008FFB"
        }
      ]
    };
  }
}
