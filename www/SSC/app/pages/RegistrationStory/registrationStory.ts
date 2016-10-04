/**
 * Created by ekersale on 28/09/2016.
 */

import {Component, OnInit} from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { APIService } from '../../services/server';
import {Directive} from 'ionic2-input-mask';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormControl} from '@angular/forms';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CORE_DIRECTIVES} from "@angular/common";

@Component({
    templateUrl: 'build/pages/RegistrationStory/registrationStory.html',
    providers: [APIService],
    directives: [CORE_DIRECTIVES, Directive, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES]
})

export class RegistrationStoryPage implements OnInit {
    registrationForm: FormGroup;
    public maskPhone = [/[0-9]/, /\d/, '.', /\d/, /\d/, '.',/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/];



    classMap: any = "NextButton";

    constructor(public navCtrl: NavController, private navParams: NavParams, private api : APIService, public alertCtrl: AlertController, private fb : FormBuilder) {
        api.setCredentials(navParams.get('credentials'));
        console.log(api.getCredentials());
    }

    ngOnInit(): any {
        this.registrationForm = this.fb.group({
            'firstName': ['', Validators.compose([Validators.required])],
            'lastName': ['', Validators.compose([Validators.required])],
            'phone':['', Validators.compose([Validators.required, this.checkPhoneNumber])],
            'jobType': ['', Validators.compose([Validators.required])],
            'authGeoloc': true,
            'state': ['Working', Validators.compose([Validators.required])],
            'workingPlace': ['Sophia Antipolis', Validators.compose([Validators.required])]
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

    onSubmit(value: string) : void {
        if (this.registrationForm.valid) {
            this.api.sendRegistrationUserInfo(this.registrationForm.controls).subscribe(
                data => {
                    console.log("success babyyyyy doll");
                    this.classMap = "animated NextButtonAnimation item-remove-animate";
                },
                error => {
                    console.error(error);
                }
            );
        }
    }
}
