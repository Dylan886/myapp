import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HTTP_OPTIONS} from './interceptor/http.interceptor';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from './model/User';
import {Resource} from './model/Resource';
import {TestPaper} from './model/TestPaper';
import {Exam} from './model/exam';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private Url = 'http://localhost:8080/Resource';
  constructor(private http: HttpClient) { }
  queryAll(): Observable<any> {
    return this.http.get<any>(this.Url + '/getAllResource', HTTP_OPTIONS);
  }

  delete(id: number) {
    const data = {
      'id': id.toString()
    };
    return this.http.get<any>(this.Url + '/deleteById', {params: data});
  }
  update(resource: Resource) {
    const data = resource;
    // @ts-ignore
    return this.http.get<any>(this.Url + '/updateById', {params: data});
  }

  getText(fileName: string) {
    let u = '../../assets/' + fileName;
    console.log(u);
    return this.http.get(u, {responseType: 'text'});
  }

  queryById(id: number) {
    const dates = {
      'uid': id.toString()
    };
    return this.http.get(this.Url + '/queryByUid', {params: dates});
  }

  upload(uid: number, author: string, resourceName: string, theModelName: string, url: string) {
    const dates = {
      'uid': uid.toString(),
      'author': author,
      'resourcename': resourceName,
      'type': theModelName,
      'isusable': '等待审核',
       'url': url,
      'date': new Date().toLocaleString()
    };
    return this.http.get(this.Url + '/insert', {params: dates}).subscribe( data => {
      console.log(data);
    });
  }

  getExam(): Observable<any>  {
    return this.http.get<any>( 'http://localhost:8080/Exam/getAllExam', HTTP_OPTIONS);
  }
  getTestPaper(): Observable<any>  {
    return this.http.get<any>( 'http://localhost:8080/TestPaper/getAllTestPaper', HTTP_OPTIONS);
  }

  compile(Code: String) {
    const data = {
      'code': Code.toString()
    };
    return this.http.get<any>('http://localhost:8080/run', {params: data});
  }

  insertTestPaper(test: TestPaper): Observable<any>  {
    const data = test;
    console.log(data);
    // @ts-ignore
    return this.http.get<any>( 'http://localhost:8080/TestPaper/insert', {params: data});
  }

  insertExam(exam: Exam): Observable<any>  {
    const data = exam;
    console.log(data);
    // @ts-ignore
    return this.http.get<any>( 'http://localhost:8080/Exam/insert', {params: data});
  }
  getGrade(examArray: Exam[]): Observable<any>  {
    // const data = examArray;
    // console.log(data);
    let headers = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=UTF-8'
      })
    };
    return this.http.post<any>( 'http://localhost:8080/Exam/getGrade', JSON.stringify(examArray), headers);
  }
}
