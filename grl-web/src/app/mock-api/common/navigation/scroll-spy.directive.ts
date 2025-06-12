import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScrollService } from 'app/core/services/scroll.service';

@Directive({
    selector: '[fuseScrollSpy]'
})
export class FuseScrollSpyDirective implements OnInit, OnDestroy {
    @Input() navigationItems: FuseNavigationItem[];
    @Input() offset: number = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _elementRef: ElementRef,
        private _fuseNavigationService: FuseNavigationService,
        private _scrollService: ScrollService
    ) {}

    ngOnInit(): void {
        // Subscribe to scroll service for active section updates
        this._scrollService.activeSection$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._updateActiveState();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(): void {
        this._updateActiveState();
    }

    private _updateActiveState(): void {
        if (!this.navigationItems) {
            return;
        }

        // Get all sections
        const sections = this.navigationItems.map(item => {
            const sectionId = item.id + '-section';
            return {
                id: item.id,
                element: document.getElementById(sectionId),
                item: item
            };
        }).filter(section => section.element);

        // Find the section that is currently in view
        const scrollPosition = window.scrollY + this.offset;
        let activeSection = null;

        for (const section of sections) {
            const rect = section.element.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = section;
                break;
            }
        }

        // Update active state of navigation items
        this.navigationItems.forEach(item => {
            item.active = activeSection && item.id === activeSection.id;
        });
    }
} 