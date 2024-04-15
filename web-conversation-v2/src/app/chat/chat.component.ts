
import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { ElementRef, ViewChild, AfterViewChecked } from '@angular/core';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('chatContainer') private chatContainer?: ElementRef;

  messages: any[] = [];
  newMessage: string = ''; // Property to bind with the input


  constructor(private ChatService: ChatService) { }
  ngAfterViewChecked(): void {
    console.log(this.chatContainer);
    console.log(this.chatContainer?.nativeElement);
    try {
      if (this.chatContainer) {
        console.log('try to scroll');
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

      if (response.modelResponse.answer) {
        const currentdate = new Date();
        const formattedDate = currentdate.toLocaleString();
        let result = response.modelResponse.answer + " [Generated at " + formattedDate + "].";
        this.messages.push({ content: result, isUser: false });
      }

      if (response.modelResponse2.answer) {
        const currentdate = new Date();
        const formattedDate = currentdate.toLocaleString();
        let result2 = response.modelResponse2.answer + " [Generated at " + formattedDate + "].";
        this.messages.push({ content2: result2, isUser: false });

      }

    });


  }

  scrollToBottom() {

    let chatContainer = document.querySelector('.chat-container');
  }
}

