/**
 * Created by ekersale on 27/09/2016.
 */

import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {md5} from './md5';
//import {NativeStorage} from 'ionic-native';
import {Platform} from 'ionic-angular';

@Injectable()
export class APIService {
  private serverAdd = "http://localhost:3000/";
  private header = new Headers();
  private userID= "";

  constructor(private http: Http, platform: Platform) {
      /*platform.ready().then(() => {
        this.getHeader();
      });*/
  }

  getConnexion(username, password) {
    password = md5(password);
    let connexion = this.http.get(`${this.serverAdd}session?email=${username}&password=${password}`);
    return connexion;
  }

  postRegistration(username, password) {
    password = md5(password);
    let registration = this.http.post(`${this.serverAdd}registration`, { email: username, password: password });
    return registration;
  }

  getEmailRecover(email) {
    let recover = this.http.get(`${this.serverAdd}recoverPwd?email=${email}`);
    return recover;
  }

  sendRegistrationUserInfo(userInfos) {
    var obj =  {
      "name": {
        "first": userInfos.firstName.value,
        "last": userInfos.lastName.value,
      },
      "function": userInfos.jobType.value,
      "phone": userInfos.phone.value.substr(0, 14),
      "state": userInfos.state.value
    };
    let registrationInfo = this.http.put(`${this.serverAdd}users/${this.userID}`, obj, {headers: this.header});
    return registrationInfo;
  }

  isUserLog(): boolean {
    if (this.userID != "")
      return true;
    else
      return false;
  }

  getHeader() {
    var those = this;
/*    NativeStorage.getItem('Credentials')
        .then(
            data => {
              those.header.append('Authorization', 'Bearer ' + data.token);
              those.userID = data.userID;
            },
            error => console.error(error)
        );*/
  }

  getCredentials() : any {
    return { userID: this.userID};
  }

  setCredentials(data) {
    this.header.append('Authorization', `Bearer ${data.data.token}`);
    this.userID = data.data.userID;
      /*NativeStorage.setItem('Credentials', {token: data.data.token, userID: data.data.userID})
          .then(
          error => console.error('Error storing item', error)
      );*/
  }
}

