import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashBoardRoutingModule } from './dash-board-routing.module';
import { MaterialModule } from 'app/material/material.module';
import { DashBoardComponent } from './dash-board.component';
import { NewsComponent } from './news/news.component';
import { ServicesComponent } from './services/services.component';
import { SolutionsComponent } from './solutions/solutions.component';
import { HireComponent } from './hire/hire.component';
import { ContactComponent } from './contact/contact.component';
import { IntroduceComponent } from './introduce/introduce.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ContactUsFormComponent } from './contact-us-form/contact-us-form.component';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PricingComponent } from './pricing/pricing.component';
import { FuseCardModule } from '@fuse/components/card';
import { AdBannerComponent } from './components/ad-banner/ad-banner.component';
import { TotalsComponent } from './totals/totals.component';

@NgModule({
  declarations: [
    DashBoardComponent,
    NewsComponent,
    ServicesComponent,
    SolutionsComponent,
    HireComponent,
    ContactComponent,
    IntroduceComponent,
    ContactUsFormComponent,
    PricingComponent,
    AdBannerComponent,
    TotalsComponent
  ],
  imports: [
    CommonModule,
    DashBoardRoutingModule,
    MaterialModule,
    NgApexchartsModule, // Thêm module này vào
    FuseCardModule,
    TranslocoModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule 
  ],
})
export class DashBoardModule { }
