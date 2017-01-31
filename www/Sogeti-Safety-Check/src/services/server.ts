/**
 * Created by ekersale on 27/09/2016.
 */

import {Injectable, EventEmitter} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {md5} from './md5';
import {App} from 'ionic-angular';
import { Observable } from "rxjs/Observable";
import 'rxjs';
import io from "socket.io-client";


@Injectable()
export class APIService {
  private serverAdd = "http://198.27.65.200:3000/";
  private GoogleAPIKey = "AIzaSyBtI1hW2w4apiZMjb-HLWWOy6nsw3KWWRY";
  private googleGeolocAPI = "https://maps.googleapis.com/maps/api/geocode/json?";
  private header = new Headers();
  private userID;
  private token;
  private socket: SocketIOClient.Socket;
  public recv : EventEmitter<any> = new EventEmitter();

  constructor(private http: Http, private _app : App) {
    this.token = window.localStorage.getItem('token');
    this.userID = window.localStorage.getItem('userID');
    if (this.token && this.userID) {
      this.header.append('Authorization', `Bearer ${this.token}`);
    }
    this.socket = io(this.serverAdd, {query:"client=" + this.userID});
    this.connectSocket();
    this.getRecvMessage();
  }

  connectSocket() {
    this.socket.on('connect', () => {
      console.log("socket connected");
    });
  }

  getRecvMessage() {
    this.socket.on('recvMsg', (data) => {
      this.recv.emit(data);
      console.log(data);
    });
  }

  sendSocketMessage(data) {
    this.socket.emit('sendMsg', data);
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

  public getUserID() {
    return this.userID;
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

  public getUserInfo(id): Observable<any> {
    if (!id)
      return this.http.get(`${this.serverAdd}users/${this.userID}`, {headers: this.header}).map((res:Response) => res.json());
    else
      return this.http.get(`${this.serverAdd}users/${id}`, {headers: this.header}).map((res:Response) => res.json());
  }

  public getChatHistory(): Observable<any> {
    return this.http.get(`${this.serverAdd}users/${this.userID}/chat`, {headers: this.header}).map((res:Response) => res.json());
  }

  public getEvents(page, query) : Observable<any>  {

    if (query == null)
      return this.http.get(`${this.serverAdd}events?page=${page}`, {headers: this.header}).map((res:Response) => res.json());
    query = encodeURI(query);
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

  public putUserPosition(position) : Observable<any> {
    return this.http.put(`${this.serverAdd}users/${this.userID}`,
      {
        geoloc : {
          latitude    : position.latitude,
          longitude   : position.longitude
        }
      }, {headers: this.header}).map((res:Response) => res.json());

  }

  public getGeolocByCoord(position) : Observable<any> {
    return this.http.get(`${this.googleGeolocAPI}latlng=${position.latitude},${position.longitude}&components=country:FR&key=${this.GoogleAPIKey}`).map((res:Response) => res.json());
  }

  public getGeolocByPlace(place) : Observable<any> {
    var uri = encodeURI(place);
    return this.http.get(`${this.serverAdd}geoloc/search?q=${uri}`).map((res:Response) => res.json());
  }

  public getComments(eventID) : Observable<any> {
    return this.http.get(`${this.serverAdd}events/${eventID}/comments`, {headers: this.header}).map((res:Response) => res.json());
  }

  public postComment(eventID, message) : Observable<any> {
    return this.http.post(`${this.serverAdd}events/${eventID}/comments`, {message : message}, {headers: this.header}).map((res:Response) => res.json());
  }

  public deleteComment(commentID, eventID) : Observable<any> {
    return this.http.delete(`${this.serverAdd}events/${eventID}/comments/${commentID}`,  {headers: this.header}).map((res:Response) => res.json());
  }

  public postSubscribe(eventID) : Observable<any> {
    return this.http.post(`${this.serverAdd}events/${eventID}/subscribe`, {}, {headers: this.header}).map((res:Response) => res.json());
  }

  public deleteSubscribe(eventID) :  Observable<any> {
    return this.http.delete(`${this.serverAdd}events/${eventID}/subscribe`, {headers: this.header}).map((res:Response) => res.json());
  }

  public postAlertEvent(controls, place) {
    return this.http.post(`${this.serverAdd}events/alerts`,
      { title       : controls.title.value,
        message     : controls.message.value,
        date        : controls.date.value,
        place       : place,
        notification: controls.notification.value,
        groups      : controls.groups.value,
      }, {headers: this.header}).map((res:Response) => res.json());
  }

  public getParticipants(eventID) {
    return this.http.get(`${this.serverAdd}events/${eventID}/participants`, {headers: this.header}).map((res:Response) => res.json());
  }

  public getUsers(userSearch) {
    return this.http.get(`${this.serverAdd}users?q=${userSearch}`,  {headers: this.header}).map((res:Response) => res.json());
  }

  public createTalk(contact) {
    return this.http.post(`${this.serverAdd}chat`, {contact: contact},{headers: this.header}).map((res:Response) => res.json())
  }

  public getTalks() {
    return this.http.get(`${this.serverAdd}chat`,  {headers: this.header}).map((res:Response) => res.json())
  }

  public getTalk(talkID) {
    return this.http.get(`${this.serverAdd}chat/${talkID}`,  {headers: this.header}).map((res:Response) => res.json())
  }
}

