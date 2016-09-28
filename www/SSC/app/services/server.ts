/**
 * Created by ekersale on 27/09/2016.
 */

import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {md5} from './md5';

@Injectable()
export class APIService {
  private serverAdd = "http://localhost:3000/";

  constructor(private http: Http) {

  }

  getConnexion(username, password) {
    password = md5(password);
    let connexion = this.http.get(this.serverAdd + `session?email=${username}&password=${password}`);
    return connexion;
  }

  postRegistration(username, password) {
    password = md5(password);
    let registration = this.http.post(this.serverAdd + 'registration', { email: username, password: password });
    return registration;
  }

  getEmailRecover(email) {
    let recover = this.http.get(this.serverAdd + `recoverPwd?email=${email}`);
    return recover;
  }
}

