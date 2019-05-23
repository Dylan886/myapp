///<reference path="../../node_modules/@angular/common/http/src/client.d.ts"/>
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HTTP_OPTIONS} from './interceptor/http.interceptor';
import {User} from './model/User';
import {Jurisdiction} from './model/Jurisdiction';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private Url = 'http://localhost:8080/Usr';
  constructor(private http: HttpClient) { }
  queryAllUser(): Observable<any> {
    return this.http.get<any>(this.Url + '/getAllUsr', HTTP_OPTIONS);
  }
  queryById(id: number): Observable<User> {
      const dates = {
        'id': id.toString()
      };
    return this.http.get<any>(this.Url + '/queryById', {params: dates});
  }
  login(username: string, password: string): Observable<any> {
    const dates = {
      'username': username,
      'password': password
    };
    return this.http.get<any>(this.Url + '/login',  {params: dates});
  }

  delete(id: number) {
    const dates = {
      'id': id.toString()
    };
    return this.http.get<any>(this.Url + '/deleteById', {params: dates});
  }

  add(value: any, age: number) {
    const dates = {
      'loginname': value.userName,
      'password': value.password,
      'age': age.toString(),
      'type': '1',
      'address': '1',
      'sex': '1',
      'tel': '1',
      'email': '1'
    };
    return this.http.get<any>(this.Url + '/insert',  {params: dates});
  }

  update(u: User): Observable<User> {
    let headers = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=UTF-8'
      })
    };
    return this.http.post<any>(this.Url + '/updateById',  JSON.stringify(u), headers);
  }
  addJur(id: number): Observable<Jurisdiction> {
    const dates = {
      'mode': '新建题目',
      'isavailable': '是',
      'uid': id.toString()
    };
    return this.http.get<any>('http://localhost:8080/Jurisdiction/insert',  {params: dates});
  }
  getJur(id: number): Observable<Jurisdiction> {
    const dates = {
      'uid': id.toString()
    };
    return this.http.get<any>('http://localhost:8080/Jurisdiction/getJurisdictionByUId', {params: dates});
  }
  getAllJur(): Observable<Jurisdiction> {
    return this.http.get<any>('http://localhost:8080/Jurisdiction/getAll', HTTP_OPTIONS);
  }

  updateJur(data: Jurisdiction) {
    let u = data;
    u.mode = data.mode.toString();
    console.log(u);
    // @ts-ignore
    return this.http.get<any>('http://localhost:8080/Jurisdiction/updateById',  {params: u});
  }
}
