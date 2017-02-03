import {Component, NgZone, ViewChild} from '@angular/core';
import {ViewController, NavParams, Platform, Content, ModalController, PopoverController} from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import {APIService} from "../../services/server";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TabProfilePage} from '../profile/profile';
import {UserPopOver} from '../user-pop-over/user-pop-over'


@Component({
  selector: 'page-events-details',
  templateUrl: 'events-details.html'
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
              private api : APIService, private fb : FormBuilder, private zone : NgZone,
              private modalCtrl : ModalController, private popoverCtrl: PopoverController)
  {
    this.event = data.get('event');
    platform.ready().then(() => {
      if (platform.is('ios')) {
        Keyboard.hideKeyboardAccessoryBar(true);
      }
      this.registerBackButtonListener();
    });
    this.commentForm = this.fb.group({
      'message': ['', Validators.compose([Validators.required])]
    });
  }

  registerBackButtonListener() {
    document.addEventListener('backbutton', () => { this.viewCtrl.dismiss({event : this.event})});
  }



  ionViewWillEnter() {
    if (this.data.get('focus') == true) {
      this.focus();
    }
  }

  hasSuscribed(event) {
    let _id = window.localStorage.getItem('userID');
    let result = event.participants.filter(function(o){
      return o._id == _id || o == _id;
    });
    return result.length > 0 ? true : false;
  }

  ionViewDidLoad() {
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

  openProfile(id) {
    this.modalCtrl.create(TabProfilePage, {userID: id}).present();
  }


  openGoogleMap() {
    let coords = this.event.zone.latitude + "," +  this.event.zone.longitude;
    if (this.platform.is('ios')) {
      window.open("maps://maps.apple.com/?q=" + coords, '_system');
    }
    else {
      window.open("geo:?q=" + coords, '_system');
    }
  }

  openPopOverParticipants() {
    this.popoverCtrl.create(UserPopOver, {
      event: this.event
    }).present();
  }
}
