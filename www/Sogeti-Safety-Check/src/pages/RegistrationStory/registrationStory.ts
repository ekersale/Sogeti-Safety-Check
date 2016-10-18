/**
 * Created by ekersale on 28/09/2016.
 */

import {Component} from '@angular/core';
import {NavController, AlertController, Platform, ToastController} from 'ionic-angular';
import { APIService } from '../../services/server';
import {TabsPage} from '../tabs/tabs';
import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Camera} from 'ionic-native';
import {LoginPage} from "../login/login"


@Component({
  templateUrl: 'registrationStory.html',
  providers: [APIService],
})

export class RegistrationStoryPage {
  registrationForm: FormGroup;
  public maskPhone = [/[0-9]/, /\d/, '.', /\d/, /\d/, '.',/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/];
  base64Image : any;

  classMap: any = "NextButton";

  constructor(public navCtrl: NavController,
              private api : APIService, public alertCtrl: AlertController,
              private fb : FormBuilder, private plateform: Platform, private toastCtrl: ToastController) {
    plateform.registerBackButtonAction((e) => { e.preventDefault();}, 501);
  }

  ionViewDidLoad() {
    this.registrationForm = this.fb.group({
      'firstName': ['', Validators.compose([Validators.required])],
      'lastName': ['', Validators.compose([Validators.required])],
      'phone':['', Validators.compose([Validators.required, this.checkPhoneNumber])],
      'jobType': ['', Validators.compose([Validators.required])],
      'authGeoloc': true,
      'state': ['Working', Validators.compose([Validators.required])],
      'workingPlace': ['Sophia Antipolis', Validators.compose([Validators.required])],
      'base64Image': ['', Validators.compose([Validators.required])]
    });
  }

  checkPhoneNumber(control: FormControl) : { [key: string]: any } {
    var valid = /(0|\+33)[1-9]([-. ]?[0-9]{2}){4}/.test(control.value);
    if (!valid)
      return {
        validateEqual: false
      };
    return null;
  }

  takePicture(){
    Camera.getPicture({
      quality : 100,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 200,
      targetHeight: 200,
      saveToPhotoAlbum: false
    }).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.registrationForm.patchValue({base64Image: "data:image/jpeg;base64," + imageData});
    }, (err) => {
      console.log(err);
    });
  }

  onSubmit(value: string) : void {
    if (this.registrationForm.valid) {
      this.api.sendRegistrationUserInfo(this.registrationForm.controls).subscribe(
        data => {
          this.classMap = "animated NextButtonAnimation item-remove-animate";
          this.navCtrl.setRoot(TabsPage, {}, {animate: true, animation: 'ios-transition', direction:'forward'});
        },
        error => {
          this.api.DisplayServerError(this.toastCtrl, error, LoginPage);
        }
      );
    }
  }
}
