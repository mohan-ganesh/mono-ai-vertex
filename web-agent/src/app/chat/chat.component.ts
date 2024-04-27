
import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomMarkupPipe } from '../directives/CustomMarkupPipe';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {



  @ViewChild('chatContainer') private chatContainer?: ElementRef;

  messages: any[] = [];
  newMessage: string = ''; // Property to bind with the input


  constructor(private ChatService: ChatService, private sanitizer: DomSanitizer) { }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngAfterViewChecked(): void {
    //console.log(this.chatContainer);
    //console.log(this.chatContainer?.nativeElement);
    try {
      if (this.chatContainer) {
        //console.log('try to scroll');
        //this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        const scrollContainer = this.chatContainer.nativeElement;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        scrollContainer.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

      }
    } catch (error) {
      console.log(error);
    }
  }

  ngOnInit(): void {
    // Assuming you have a reference to the chat container element
    //console.log('im-onInit' + document.querySelector('.chat-container'))
    //this.chatContainer = document.querySelector('.chat-container');
    //console.log("reference of " + this.chatContainer);
  }





  sendMessage(message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Prevent sending empty messages

    this.messages.push({ content: trimmedMessage, isUser: true });
    this.newMessage = ''; // Clear the input

    this.ChatService.sendMessage(trimmedMessage).subscribe(response => {



      if (response) {
        const currentdate = new Date();
        const formattedDate = currentdate.toLocaleString();
        let result = response.response + "<i> [Generated at " + formattedDate + "].</i>";



        const tempId = response.tempId;



        this.messages.push({ content: result, isUser: false });
      }


    });


  }

  scrollToBottom() {

    let chatContainer = document.querySelector('.chat-container');
  }
}

