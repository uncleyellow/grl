import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { take } from 'rxjs';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { ScrollService } from 'app/core/services/scroll.service';

@Component({
    selector       : 'languages',
    templateUrl    : './languages.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'languages'
})
export class LanguagesComponent implements OnInit, OnDestroy
{
    availableLangs: AvailableLangs;
    activeLang: string;
    flagCodes: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService,
        private _scrollService: ScrollService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the available languages from transloco
        this.availableLangs =[
            {id: 'tr', label: 'Việt Nam'},
            {id: 'en', label: 'English'},
            // {id: 'tr', label: 'Việt Nam'},
        ]

        // Subscribe to language changes
        this._translocoService.langChanges$.subscribe((activeLang) => {
            // Get the active lang
            this.activeLang = activeLang;
            
            // Store in localStorage
            localStorage.setItem('activeLang', activeLang);
            
            // Update the navigation
            this._updateNavigation(activeLang);
        });

        // Set the country iso codes for languages for flags
        this.flagCodes = {
            'tr': 'tr',
            'en': 'us',
        };

        // Set initial language based on localStorage or default to 'tr'
        const storedLang = localStorage.getItem('activeLang');
        if (!storedLang || storedLang !== 'tr') { 
            this.setActiveLang('tr'); // Set to 'tr' (Vietnamese)
        }

        // Subscribe to scroll service for active section updates
        this._scrollService.activeSection$.subscribe(section => {
            this._updateActiveSection(section);
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the active lang
     *
     * @param lang
     */
    setActiveLang(lang: string): void
    {
        // Set the active lang
        this._translocoService.setActiveLang(lang);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the navigation
     *
     * @param lang
     * @private
     */
    private _updateNavigation(lang: string): void
    {
        // Get the component -> navigation data -> item
        const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

        // Return if the navigation component does not exist
        if (!navComponent) {
            return null;
        }

        // Get the flat navigation data
        const navigation = navComponent.navigation;

        // Update all navigation items
        const itemsToUpdate = [
            { id: 'welcome', key: 'welcome' },
            { id: 'services', key: 'services' },
            { id: 'solutions', key: 'solutions' },
            { id: 'news', key: 'news' },
            { id: 'hire', key: 'hire' },
            { id: 'contact', key: 'contact' }
        ];

        itemsToUpdate.forEach(item => {
            const navItem = this._fuseNavigationService.getItem(item.id, navigation);
            if (navItem) {
                this._translocoService.selectTranslate(item.key).pipe(take(1))
                    .subscribe((translation) => {
                        // Set the title
                        navItem.title = translation;
                    });
            }
        });

        // Refresh the navigation component
        navComponent.refresh();
    }

    /**
     * Update the active section in navigation
     *
     * @param section
     * @private
     */
    private _updateActiveSection(section: string): void
    {
        const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');
        if (!navComponent) {
            return;
        }

        const navigation = navComponent.navigation;
        const itemsToUpdate = [
            'welcome',
            'services',
            'solutions',
            'news',
            'hire',
            'contact'
        ];

        itemsToUpdate.forEach(itemId => {
            const navItem = this._fuseNavigationService.getItem(itemId, navigation);
            if (navItem) {
                navItem.active = itemId === section;
            }
        });

        navComponent.refresh();
    }
}
