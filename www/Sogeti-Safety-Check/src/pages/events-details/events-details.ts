import { Component, NgZone } from '@angular/core';
import {ViewController, NavParams, Platform} from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import {APIService} from "../../services/server";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'page-events-details',
  templateUrl: 'events-details.html',
  providers: [APIService]
})

export class EventsDetails {

  private event;
  private comments = [];
  private error : string = "";
  commentForm: FormGroup;
  currentUser = window.localStorage.getItem('userID');

  constructor(public viewCtrl: ViewController, public data : NavParams, platform : Platform, private api : APIService, private fb : FormBuilder, private zone : NgZone) {
    this.event = data.get('event');
    if (platform.is('ios')) {
      Keyboard.hideKeyboardAccessoryBar(true);
    }

  }

  ionViewDidLoad() {
    this.commentForm = this.fb.group({
      'message': ['', Validators.compose([Validators.required])]
    });
    this.currentUser = window.localStorage.getItem('userID');
    this.api.getComments(this.event._id).subscribe(
      data => {
        console.log(data.data.comments);
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
        this.api.getComments(this.event._id).subscribe(
          data => {
            this.zone.run(() => {
              this.comments = data.data.comments;
              this.commentForm.reset();
            });
          },
          error => {
            if (error) this.error = "An error occurred. Please reload the page.";
          }
        );
      },
      error => this.error = "Error while adding comment. Please try again."
    );
  }

  dismiss() {
    this.viewCtrl.dismiss();
    Keyboard.hideKeyboardAccessoryBar(false);
  }
}
