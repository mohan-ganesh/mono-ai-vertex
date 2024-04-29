import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStorageServiceService } from "../services/session-storage-service.service"
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.conversation_api_url;

  constructor(private http: HttpClient, private sessionStorageService: SessionStorageServiceService) { }

  sendMessage(message: string): Observable<any> {

    let queryId = this.sessionStorageService.getValue("queryId");
    if (queryId == null) {
      queryId = "-1";
    }
    // Set the content type to application/json
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-temp-id': queryId

      })
    };

    const body = JSON.stringify({ query: message });

    return this.http.post<any>(this.apiUrl, body, httpOptions);
  }
}
