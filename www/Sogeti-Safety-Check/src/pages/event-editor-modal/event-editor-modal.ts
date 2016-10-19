import { Component } from '@angular/core';
import {ViewController} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";

/*
  Generated class for the EventEditorModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-event-editor-modal',
  templateUrl: 'event-editor-modal.html'
})
export class EventEditorModal {

  eventForm: FormGroup;


  constructor(public viewCtrl: ViewController, private fb : FormBuilder) {}

  ionViewDidLoad() {
    this.eventForm = this.fb.group({
        'title': ['', Validators.compose([Validators.required])],
        'dateStart': ['', Validators.compose([Validators.required])],
        'dateEnd': ['', Validators.compose([Validators.required])]
    });
  }

  onSubmit() {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
