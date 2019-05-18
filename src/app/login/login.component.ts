import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;
  user = null;
  username = null;
  password = null;

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {this.login(); }
  }

  constructor(private fb: FormBuilder, private userService: UserService, private routers: Router ) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }
  login(): void {
    this.userService.login(this.username, this.password).subscribe(data =>  {
      this.user = data;
      console.log(data);
      if ( this.user === null) {
        this.password = null;
        alert('账号或者密码错误，请重新输入');
      } else {
        sessionStorage.setItem('name', this.username);
        sessionStorage.setItem('type', this.user.type);
        sessionStorage.setItem('id', this.user.id);
        this.routers.navigate(['teacher']);
      }
    });
  }
}
