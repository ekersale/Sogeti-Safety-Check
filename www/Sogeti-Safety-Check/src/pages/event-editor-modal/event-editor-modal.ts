import {Component } from '@angular/core';
import {ViewController, NavController, ModalController} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {APIService} from "../../services/server";
import {PreviewEvent} from "../preview-event/preview-event";
import {GoogleMapModal} from '../google-map-modal/google-map-modal'
/*
  Generated class for the EventEditorModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-event-editor-modal',
  templateUrl: 'event-editor-modal.html',
  providers: [APIService]
})
export class EventEditorModal {

  eventForm: FormGroup;
  file_srcs : string[] = [];
  sendAlert : Boolean = false;
  groups = [];
  triggerFileInput : string = 'NO IMAGE SELECTED';
  addressInput : string = '';

  constructor(public viewCtrl: ViewController, public navCtrl : NavController, private fb : FormBuilder, private api : APIService, public modalCtrl : ModalController) {
    this.api.getUserGroups().subscribe(data=> {
        this.groups = data.data.groups;
        console.log(data);
      },
      err => alert(err)
    );
  }

  ionViewDidLoad() {
    this.eventForm = this.fb.group({
        'title': ['', Validators.compose([Validators.required])],
        'dateStart': ['', Validators.compose([Validators.required])],
        'dateEnd': ['', Validators.compose([Validators.required])],
        'filesInput' : [''],
        'message': ['', Validators.compose([Validators.required])],
        'notification' : [''],
        'groups': ['', Validators.compose([Validators.required])]
    });
  }

  onSubmit() {
      this.api.postNewEvent({event: this.eventForm.controls, images : this.file_srcs}).subscribe(
        data => this.viewCtrl.dismiss(),
        error => alert(error)
      );
  }

  preview() {
    this.navCtrl.push(PreviewEvent,{event : this.eventForm.controls, images : this.file_srcs}, {animate: true, animation: 'ios-transition', direction:'forward'});
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  fileChange(input) {
    if (input.files.length <= 0)
      return;
    this.file_srcs = [];
    for (var i = 0; i < input.files.length; i++) {
      var reader = new FileReader();
          reader.addEventListener("load", (event) => {
            this.file_srcs.push((event.target as FileReader).result);
            console.log(this.file_srcs);
        }, false);
        reader.readAsDataURL(input.files[i]);
    }
    if (input.files.length == 1)
      this.triggerFileInput = input.files.length + ' IMAGE SELECTED';
    else
      this.triggerFileInput = input.files.length + ' IMAGES SELECTED';
    console.log(this.triggerFileInput);
  }

  removeItemImage(item) {
    for(let i = 0; i < this.file_srcs.length; i++) {
      if(this.file_srcs[i] == item){
        this.file_srcs.splice(i, 1);
      }
    }
    if (this.file_srcs.length == 1)
      this.triggerFileInput = this.file_srcs.length + ' IMAGE SELECTED';
    else if (this.file_srcs.length > 1)
      this.triggerFileInput = this.file_srcs.length + ' IMAGES SELECTED';
    else
      this.triggerFileInput = "NO IMAGE SELECTED";

  }

  openMapModal() {
    let MapModal = this.modalCtrl.create(GoogleMapModal);
    MapModal.onDidDismiss(data => {
      console.log(data);
      this.addressInput = data.place;
    });
    MapModal.present();
  }
}
