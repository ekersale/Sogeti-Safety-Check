/**
 * Created by ekersale on 07/10/2016.
 */

import {Component, ViewChild, ElementRef} from '@angular/core';
import {APIService} from '../../services/server'
import {NavController} from "ionic-angular";
import io from "socket.io-client";

@Component({
    selector: "TabChatPage",
    templateUrl: 'chat.html',
    providers: [APIService]
})

export class TabChatPage {

    searchItems = [];
    conversation = [];
    socket: SocketIOClient.Socket;
    searchInput= '';

    constructor(public navCtrl : NavController, private api : APIService) {
      this.socket = io("http://198.27.65.200:3000/", {query:"client=" + api.getUserID()});
      this.socket.on('connect', () => {
        console.log("coucou");
      });
    }

    getItems(ev : any) {
      let val = ev.target.value;
      this.api.getUsers(val).subscribe(
        data => {
          console.log(data.data.users);
          this.searchItems = data.data.users;
        },
        err => {}
      );
    }

    addConversation(contact) {
      this.searchInput='';
      console.log(contact);
    }
}
