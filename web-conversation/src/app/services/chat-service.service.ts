import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'https://vertex-serach-api-sn5rsq6dda-uc.a.run.app/conversation';

  //private apiUrl = 'http://localhost:3000/conversation';

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<any> {

    // Set the content type to application/json
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    const body = JSON.stringify({ query: message });

    return this.http.post<any>(this.apiUrl, body, httpOptions);
  }
}
