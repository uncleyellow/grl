import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment} from '../enviroment';
import { Observable } from 'rxjs/internal/Observable';
@Injectable({
  providedIn: 'root',
})
export class DashBoardService {
  private apiUrl = `${environment.api.url}`; // URL từ environment
  private header = `${environment.api.headers}`; // URL từ environment

  constructor(
    private http: HttpClient,

) {

  }
  
  getSheetData(id): Observable<any> {
    const headers = new HttpHeaders(environment.api.headers);

    
    return this.http.get<any>(`${this.apiUrl}/${id}`,{ headers });
  }

}
