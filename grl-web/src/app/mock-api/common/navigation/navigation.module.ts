import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseNavigationComponent } from './navigation.component';
import { FuseScrollSpyDirective } from './scroll-spy.directive';

@NgModule({
    declarations: [
        FuseNavigationComponent,
        FuseScrollSpyDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        FuseNavigationComponent,
        FuseScrollSpyDirective
    ]
})
export class FuseNavigationModule { } 