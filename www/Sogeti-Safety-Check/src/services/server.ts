/**
 * Created by ekersale on 27/09/2016.
 */

import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {md5} from './md5';
import {App} from 'ionic-angular';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';


@Injectable()
export class APIService {
  private serverAdd = "http://198.27.65.200:3000/";
  private header = new Headers();
  private userID;
  private token;

  constructor(private http: Http, private _app : App) {
    this.token = window.localStorage.getItem('token');
    this.userID = window.localStorage.getItem('userID');
    if (this.token && this.userID) {
      this.header.append('Authorization', `Bearer ${this.token}`);
    }
  }

  DisplayServerError(toastCtrl, err, Page) {
    let app  = this._app.getRootNav();
    switch (err.status) {
      case 0 :
        toastCtrl.create({
          message: "Server unreachable please contact the administrator.",
          duration: 4000,
          position: 'bottom'
        }).present();
        break;
      case 401 :
        this.removeCredentials();
        app.setRoot(Page);
        break;
      default:
        toastCtrl.create({
          message: "Unhandled error, please report to administrator",
          duration: 4000,
          position: 'bottom'
        }).present();
        break;
    }
  }

  setCredentials(data) {

    this.header.append('Authorization', `Bearer ${data.data.token}`);
    this.userID = data.data.userID;

    window.localStorage.setItem("userID", data.data.userID);
    window.localStorage.setItem("token", data.data.token);
  }

  removeCredentials() {
    window.localStorage.removeItem("userID");
    window.localStorage.removeItem("token");
  }


  public getConnexion(userInfo): Observable<any> {
    let password = md5(userInfo.password.value);
    return this.http.get(`${this.serverAdd}session?email=${userInfo.username.value}&password=${password}`).map((res:Response) => res.json());
  }

  public postRegistration(userInfos): Observable<any> {
    let password = md5(userInfos.password.value);
    return this.http.post(`${this.serverAdd}registration`, { email: userInfos.username.value, password: password }).map((res:Response) => res.json());
  }

  public getEmailRecover(email): Observable<any> {
    return this.http.get(`${this.serverAdd}recoverPwd?email=${email}`).map((res:Response) => res.json());
  }

  sendRegistrationUserInfo(userInfos): Observable<any> {
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
    return this.http.put(`${this.serverAdd}users/${this.userID}`, obj, {headers: this.header}).map((res:Response) => res.json());
  }

  public isUserLog(): Observable<any> {

    return this.http.get(`${this.serverAdd}isUserAuth`,  {headers: this.header}).map((res:Response) => res.json());
  }

  public getUserInfo(): Observable<any> {
    return this.http.get(`${this.serverAdd}users/${this.userID}`, {headers: this.header}).map((res:Response) => res.json());
  }

  public getChatHistory(): Observable<any> {
    return this.http.get(`${this.serverAdd}users/${this.userID}/chat`, {headers: this.header}).map((res:Response) => res.json());
  }

  public getEvents(page, query) : Observable<any>  {
    if (query == null)
      return this.http.get(`${this.serverAdd}events?page=${page}`, {headers: this.header}).map((res:Response) => res.json());
    else
      return this.http.get(`${this.serverAdd}events?page=${page}&q=${query}`, {headers: this.header}).map((res:Response) => res.json());
  }

  public postTokenPushNotification(token, accept) : Observable<any> {
    let obj = {
      notify : {
        accept : (!accept || accept == true) ? true : false,
        token : token
      }
    };
    return this.http.put(`${this.serverAdd}users/${this.userID}`, obj, {headers: this.header}).map((res:Response) => res.json());
  }

  public getUserGroups() : Observable<any> {
    return this.http.get(`${this.serverAdd}users/${this.userID}/groups`, {headers: this.header}).map((res:Response) => res.json());
  }

  public sendPushNotification(controls) : Observable<any> {
    let obj = {
        groups  : controls.groups.value,
        title   : controls.title.value,
        message : controls.message.value
    };
    return this.http.post(`${this.serverAdd}events/push`, obj, {headers: this.header}).map((res:Response) => res.json());
  }

  public postNewEvent(eventInfos) : Observable<any> {
    let obj = {
      images      : eventInfos.images,
      name        : eventInfos.event.title.value,
      message     : eventInfos.event.message.value,
      target      : eventInfos.event.groups.value,
      start_at    : eventInfos.event.dateStart.value,
      end_at      : eventInfos.event.dateEnd.value
    };
    return this.http.post(`${this.serverAdd}events`, obj, {headers: this.header}).map((res:Response) => res.json());
  }
}

