import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { FuseScrollSpyDirective } from './scroll-spy.directive';
import { ScrollService } from 'app/core/services/scroll.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'fuse-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss']
})
export class FuseNavigationComponent implements OnInit, OnDestroy {
    @ViewChild(FuseScrollSpyDirective) scrollSpy: FuseScrollSpyDirective;
    @Input() navigation: FuseNavigationItem[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _scrollService: ScrollService
    ) {}

    ngOnInit(): void {
        // Subscribe to scroll service for active section updates
        this._scrollService.activeSection$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(section => {
                if (this.scrollSpy) {
                    this.scrollSpy['_updateActiveState']();
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
} 