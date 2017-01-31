/**
 * Created by ekersale on 07/10/2016.
 */

import {Component} from '@angular/core';
import {APIService} from '../../services/server'
import {NavController} from "ionic-angular";
import {Talk} from '../talk/talk';

@Component({
    selector: "TabChatPage",
    templateUrl: 'chat.html',
})

export class TabChatPage {

    searchItems = [];
    conversations = [];
    searchInput= '';

    constructor(public navCtrl : NavController, private api : APIService) {
      this.getTalks();
    }

    getTalks() {
      this.api.getTalks().subscribe(
        data => {
          for (let talk of data.data.talks) {
            for (let index in talk.participants) {
              if (talk.participants[index]._id == this.api.getUserID())
                talk.participants.splice(index, 1);
            }
          }
          this.conversations = data.data.talks;
        },
        error => {
          // create error popup
        }
      )
    }

    getItems(ev : any) {
      ev.preventDefault();
      this.searchItems = [];
      let val = ev.target.value;
      if (val == "")
        return;
      this.api.getUsers(val).subscribe(
        data => {
          this.searchItems = data.data.users.filter(user => {
            return user._id != this.api.getUserID()
          });
        },
        err => {}
      );
    }

    addConversation(contact) {
      this.searchInput='';
      this.searchItems = [];
      let elem = this.conversations.filter(talk => {
        return talk.participants[0]._id == contact._id;
      });
      console.log(elem);
      if (elem.length > 0)
      {
        this.navCtrl.push(Talk,{contact: elem[0]}, {animate: true, animation: 'ios-transition'});
      }
      else {
        this.api.createTalk(contact).subscribe(
          data => {
            this.getTalks();
            for (let index in data.data.talk.participants) {
              if (data.data.talk.participants[index]._id == this.api.getUserID())
                data.data.talk.participants.splice(index, 1);
            }
            this.navCtrl.push(Talk,{contact: data.data.talk}, {animate: true, animation: 'ios-transition'});
          },
          error => {}
        );
      }
    }

    showConversation(contact) {
      console.log(contact);
      this.navCtrl.push(Talk,{contact: contact}, {animate: true, animation: 'ios-transition'});
    }

    ionViewWillEnter() {
      this.getTalks();
    }
}
