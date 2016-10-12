/**
 * Created by ekersale on 27/09/2016.
 */

import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {md5} from './md5';
//import {NativeStorage} from 'ionic-native';
import {Platform} from 'ionic-angular';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';


@Injectable()
export class APIService {
  private serverAdd = "http://198.27.65.200:3000/";
  private header = new Headers();
  private userID;
  private token;

  constructor(private http: Http, platform: Platform) {
    this.token = window.localStorage.getItem('token');
    this.userID = window.localStorage.getItem('userID');
    if (this.token && this.userID) {
      this.header.append('Authorization', `Bearer ${this.token}`);
    }
      /*platform.ready().then(() => {
        this.getHeader();
      });*/
  }

  DisplayServerError(toastCtrl, err) {
    if (err.status == 0)
      toastCtrl.create({
        message: "Server unreachable please contact the administrator.",
        duration: 4000,
        position: 'bottom'
      }).present();
  }

  public getConnexion(username, password): Observable<any> {
    password = md5(password);
    return this.http.get(`${this.serverAdd}session?email=${username}&password=${password}`);
  }

  public postRegistration(username, password): Observable<any> {
    password = md5(password);
    return this.http.post(`${this.serverAdd}registration`, { email: username, password: password });
  }

  public getEmailRecover(email): Observable<any> {
    return this.http.get(`${this.serverAdd}recoverPwd?email=${email}`);
  }

  sendRegistrationUserInfo(userInfos): Observable<any> {
    console.log(userInfos.base64Image.value);
    var obj =  {
      "name": {
        "first": userInfos.firstName.value,
        "last": userInfos.lastName.value,
      },
      "function": userInfos.jobType.value,
      "phone": userInfos.phone.value.substr(0, 14),
      "state": userInfos.state.value,
      "profileImg": userInfos.base64Image.value
    };
    return this.http.put(`${this.serverAdd}users/${this.userID}`, obj, {headers: this.header});
  }

  public isUserLog(): boolean {
    console.log('token ' + this.token);
    console.log('userID ' + this.userID);
    return (this.token != null && this.userID != null);
  }

  getHeader() {
/*    NativeStorage.getItem('Credentials')
        .then(
            data => {
              those.header.append('Authorization', 'Bearer ' + data.token);
              those.userID = data.userID;
            },
            error => console.error(error)
        );*/
  }

  setCredentials(data) {

    this.header.append('Authorization', `Bearer ${data.data.token}`);
    this.userID = data.data.userID;

    window.localStorage.setItem("userID", data.data.userID);
    window.localStorage.setItem("token", data.data.token);
      /*NativeStorage.setItem('Credentials', {token: data.data.token, userID: data.data.userID})
          .then(
          error => console.error('Error storing item', error)
      );*/
  }

  public getUserInfo(): Observable<any> {
    return this.http.get(`${this.serverAdd}users/${this.userID}`, {headers: this.header});
  }

  public getChatHistory(): Observable<any> {
    return this.http.get(`${this.serverAdd}users/${this.userID}/chat`, {headers: this.header});
  }

  public getEvents(page) : Observable<any> {
    return this.http.get(`${this.serverAdd}events?page=${page}`, {headers: this.header}).map((res:Response) => res.json());
  }
}

