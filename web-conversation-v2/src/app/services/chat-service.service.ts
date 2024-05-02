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

  /**
   * 
   * @param message 
   * @returns 
   */
  sendMessage(message: string): Observable<any> {

    if (this.sessionStorageService.getValue("api_endpoint") != null) {
      let type = this.sessionStorageService.getValue("api_endpoint");
      if (type === "compare") {
        this.apiUrl = environment.conversation_compare_api_url;
      }
    }
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
