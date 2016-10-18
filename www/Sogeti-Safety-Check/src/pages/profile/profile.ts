/**
 * Created by ekersale on 05/10/2016.
 */

import {Component} from '@angular/core';
import {APIService} from '../../services/server'
import {NavController, ToastController} from "ionic-angular";
import {LoginPage} from "../login/login"
import {App} from 'ionic-angular';

@Component({
  templateUrl: 'profile.html',
  providers: [APIService]
})


export class TabProfilePage {

  public name = { first: '', last: ''};
  public function : string = '';
  public state: string = '';
  public phone: string = '';
  public email: string = '';
  public profileImg: string = 'https://case.edu/medicine/admissions/media/school-of-medicine/admissions/classprofile.png';
  public events = [];

  constructor(private api: APIService, public navCtrl: NavController, private _app : App, private toastCtrl : ToastController) {
    this.api.getUserInfo().subscribe(
      data => {
        if (!data.data.user) {
          this.navCtrl.setRoot(LoginPage);
        }
        console.log(data.data.user);
        this.name = data.data.user.name;
        this.function = data.data.user.function;
        this.state = (data.data.user.state) ? data.data.user.state : 'undefined';
        this.phone = (data.data.user.phone) ? data.data.user.phone : 'undefined';
        this.email = (data.data.user.email) ? data.data.user.email : 'undefined';
        this.profileImg = (data.data.user.profileImg) ? data.data.user.profileImg.relativePath : 'https://case.edu/medicine/admissions/media/school-of-medicine/admissions/classprofile.png';
        this.events = (data.data.user.participations) ? data.data.user.participations : []
      },
      error => this.api.DisplayServerError(toastCtrl, error, LoginPage)
    );
  }

  logout() {
      this.api.removeCredentials();
      const root = this._app.getRootNav();
      root.setRoot(LoginPage);
  }


}
