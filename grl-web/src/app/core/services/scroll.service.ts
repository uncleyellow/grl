import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private activeSectionSubject = new BehaviorSubject<string>('');
  activeSection$ = this.activeSectionSubject.asObservable();

  constructor() {
    // Add scroll event listener
    window.addEventListener('scroll', () => {
      this.updateActiveSection();
    });
  }

  private updateActiveSection(): void {
    const sections = [
      'welcome-section',
      'services-section',
      'solutions-section',
      'news-section',
      'hire-section',
      'contact-section'
    ];

    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // Add offset for better detection

    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY;
        const offsetBottom = offsetTop + rect.height;

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          currentSection = sectionId.replace('-section', '');
          break;
        }
      }
    }

    if (currentSection !== this.activeSectionSubject.value) {
      this.activeSectionSubject.next(currentSection);
    }
  }

  setActiveSection(section: string): void {
    this.activeSectionSubject.next(section);
  }
} 