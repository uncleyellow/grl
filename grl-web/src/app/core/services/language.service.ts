import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private activeLangSubject = new BehaviorSubject<string>('tr');
  activeLang$ = this.activeLangSubject.asObservable();

  constructor() {}

  setActiveLang(lang: string) {
    this.activeLangSubject.next(lang);
  }

  getActiveLang(): string {
    return this.activeLangSubject.value;
  }
} 