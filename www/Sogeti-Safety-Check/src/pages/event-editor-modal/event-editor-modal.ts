import {Component } from '@angular/core';
import {ViewController, NavController} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {APIService} from "../../services/server";
import {PreviewEvent} from "../preview-event/preview-event";

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

  constructor(public viewCtrl: ViewController, public navCtrl : NavController, private fb : FormBuilder, private api : APIService) {
    this.api.getUserGroups().subscribe(data=> {
        this.groups = data.data.groups;
        console.log(this.groups);
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
        data => console.log(data),
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
    console.log(input.files);
    this.file_srcs = [];
    for (var i = 0; i < input.files.length; i++) {
      var img = document.createElement("img");
      var reader = new FileReader();
          reader.addEventListener("load", (event) => {
            this.file_srcs.push((event.target as FileReader).result);
            console.log(this.file_srcs);
        }, false);
        reader.readAsDataURL(input.files[i]);
    }
  }
}
