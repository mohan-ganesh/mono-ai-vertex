
import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomMarkupPipe } from '../directives/CustomMarkupPipe';
import { ActivatedRoute } from '@angular/router';
import { SessionStorageServiceService } from "../services/session-storage-service.service"
import { environment } from "../../environments/environment"
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('chatContainer') private chatContainer?: ElementRef;

  messages: any[] = [];
  newMessage: string = ''; // Property to bind with the input
  queryParams: any;
  loading: boolean = false;
  userInteracted: boolean = false;

  constructor(private ChatService: ChatService, private sanitizer: DomSanitizer, private route: ActivatedRoute, private sessionStorageService: SessionStorageServiceService, private renderer: Renderer2) { }

  /**
   * 
   * @param html 
   * @returns 
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * 
   */
  ngAfterViewChecked(): void {

    try {
      console.log(window.innerWidth)
      if (window.innerWidth > 768) {
        if (this.chatContainer) {
          const scrollContainer = this.chatContainer.nativeElement;
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
          scrollContainer.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 
   */
  ngOnInit(): void {
    // Assuming you have a reference to the chat container element
    //console.log('im-onInit' + document.querySelector('.chat-container'))
    //this.chatContainer = document.querySelector('.chat-container');
    //console.log("reference of " + this.chatContainer);

    this.route.queryParams.subscribe(params => {
      // Read the query parameters
      this.queryParams = params;
      // Set the value in session storage
      if (this.queryParams.type) {
        this.sessionStorageService.setValue(environment.api_endpoint, this.queryParams.type);
      } else {
        this.sessionStorageService.setValue(environment.api_endpoint, "default");
      }
    });
  }



  /**
   * 
   * @param message 
   * @returns 
   */

  sendMessage(message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Prevent sending empty messages

    this.messages.push({ content: trimmedMessage, isUser: true });
    this.newMessage = ''; // Clear the input

    // Set loading to true after 5 seconds
    setTimeout(() => {
      this.loading = true;
    }, 3000);

    this.ChatService.sendMessage(trimmedMessage).subscribe(response => {
      this.loading = false;

      if (response.modelResponse.answer) {
        const currentdate = new Date();
        const formattedDate = currentdate.toLocaleString();
        let result = response.modelResponse.answer + "<i> [Generated at " + formattedDate + "].</i>";
        this.messages.push({ content: result, isUser: false });
      }

      if (response.modelResponse2) {
        const currentdate = new Date();
        const formattedDate = currentdate.toLocaleString();
        let result2 = response.modelResponse2.answer + "<i> [Generated at " + formattedDate + "]. </i>";
        this.messages.push({ content2: result2, isUser: false });

      }

    }, (error) => {
      console.log("error occured", error);
      this.loading = false;
    });


  }

  /**
   * 
   */
  scrollToBottom() {
    let chatContainer = document.querySelector('.chat-container');
  }
}

