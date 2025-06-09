import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment} from '../enviroment';
import { Observable } from 'rxjs/internal/Observable';
@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiUrl = `${environment.api.url}`; // URL từ environment
 
  constructor(
    private http: HttpClient
) {
    
}

  getSheetData(id): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
