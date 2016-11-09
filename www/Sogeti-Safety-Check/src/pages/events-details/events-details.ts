import {Component, NgZone, ViewChild} from '@angular/core';
import {ViewController, NavParams, Platform, Content} from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import {APIService} from "../../services/server";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'page-events-details',
  templateUrl: 'events-details.html',
  providers: [APIService],
})

export class EventsDetails {

  private event;
  private comments = [];
  private error : string = "";
  commentForm: FormGroup;
  currentUser = window.localStorage.getItem('userID');
  private wobbleState : string = "active";
  @ViewChild(Content) content: Content;

  constructor(public viewCtrl: ViewController, public data : NavParams, private platform : Platform,
              private api : APIService, private fb : FormBuilder, private zone : NgZone)
  {
    this.event = data.get('event');
    if (platform.is('ios')) {
      Keyboard.hideKeyboardAccessoryBar(true);
    }

  }

  ionViewWillEnter() {
    if (this.data.get('focus') == true) {
      this.focus();
    }
  }

  hasSuscribed(event) {
    let _id = window.localStorage.getItem('userID');
    let result = event.participants.filter(function(o){
      console.log(o._id == _id || o == _id);
      return o._id == _id || o == _id;
    });
    return result.length > 0 ? true : false;
  }

  ionViewDidLoad() {
    this.commentForm = this.fb.group({
      'message': ['', Validators.compose([Validators.required])]
    });
    this.currentUser = window.localStorage.getItem('userID');
    this.api.getComments(this.event._id).subscribe(
      data => {
        this.comments = data.data.comments;
      },
      error => {
        if (error) this.error = "An error occurred. Please reload the page.";
      }
    );
  }

  onSubmit() {
    this.api.postComment(this.event._id, this.commentForm.controls['message'].value).subscribe(
      data  => {
        this.comments.push(data.data.comment);
        this.commentForm.reset();
      },
      error => this.error = "Error while adding comment. Please try again.",
      () => this.content.scrollToBottom()
    );
  }

  removeComment(comment) {
    this.api.deleteComment(comment._id, this.event._id).subscribe(
      data => {
        this.comments.splice(this.comments.indexOf(comment), 1);
        this.commentForm.reset();
      },
      error => this.error = "Error while adding comment. Please try again."
    )
  }

  dismiss() {
    this.event.comments = this.comments;
    this.viewCtrl.dismiss({event : this.event});
    Keyboard.hideKeyboardAccessoryBar(false);
  }

  reset() {
    this.zone.run(() => {
      this.wobbleState = "inactive";
    });
  }

  focus() {
    Keyboard.show();
  }

  subscribeEvent() {
    this.api.postSubscribe(this.event._id).subscribe(
      data => {
        console.log(data);
        this.event.participants = data.data.event.participants;
      },
      error => console.log(error)
    );
  }

  unsubscribeEvent() {
    this.api.deleteSubscribe(this.event._id).subscribe(
      data => {this.event.participants = data.data.event.participants;},
      error => console.log(error)
    )
  }
}
