import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashBoardComponent } from './dash-board.component';
import { ContactComponent } from './contact/contact.component';
import { HireComponent } from './hire/hire.component';
import { NewsComponent } from './news/news.component';
import { ServicesComponent } from './services/services.component';
import { SolutionsComponent } from './solutions/solutions.component';


const routes: Routes = [
    { path: '', component: DashBoardComponent},
    { path: 'contact', component: ContactComponent},
    { path: 'hire', component: HireComponent},
    { path: 'news', component: NewsComponent},
    { path: 'services', component: ServicesComponent},
    { path: 'solutions', component: SolutionsComponent},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashBoardRoutingModule {}
