import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http'
import { CustomMarkupPipe } from './directives/CustomMarkupPipe'

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    CustomMarkupPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
