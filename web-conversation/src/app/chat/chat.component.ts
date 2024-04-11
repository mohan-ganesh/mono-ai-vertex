import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat-service.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = ''; // Property to bind with the input

  constructor(private ChatService: ChatService) { }

  ngOnInit(): void {
    // Initialize chat history
    //this.messages.push({ content: "Welcome to the chat! ", isUser: false });
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
    });
  }
}
