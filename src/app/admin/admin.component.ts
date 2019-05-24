import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Observable, Observer} from 'rxjs';
import {User} from '../model/User';
import {UserService} from '../user.service';
import {validate} from 'codelyzer/walkerFactory/walkerFn';
import {Resource} from '../model/Resource';
import {ResourceService} from '../resource.service';
import {Router} from '@angular/router';
import {Timeouts} from 'selenium-webdriver';
import {Exam} from '../model/exam';
import {TestPaper} from '../model/TestPaper';
import {Jurisdiction} from '../model/Jurisdiction';
type MODE = 'null'|'add'|'other'|'approved'|'deny'|'draft'|'deleted'|'exam'|'testPaper'|'ae'|'de'|'at'|'dt'| 'empower';
// User: add, other
// Resource: approved, deny, draft,deleted已移除
// exam: exam, ae, de
// jurisdiction: empower
// testPaper: testPaper, at, dt
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // new data
  newExam: Exam = new Exam();
  newResource: Resource = new Resource();
  newUser: User = new User();
  newTest: TestPaper = new TestPaper();
  // resource
    resource: Resource[];    // all
    resource1: Resource[];    // filter
  // user
  user: User[];
  user1: User[];
  // exam
  exam: Exam[];
  // testPaper
  testPaper: TestPaper[];
  // jurisdiction
  jurisdiction: Jurisdiction[];
  // 登录用户的权限
  theJur: String;
  // html跳转
  mode: MODE  = 'null' ;
  // 双向绑定数据
  age = 20;
  inputValue: string;
  username: string;
  password: string;
  options = [];
  listOfOption = [{ label: '用户管理', value: '用户管理'},
                  { label: '资源管理', value: '资源管理'},
                  { label: '题库管理', value: '题库管理'},
                  { label: '试卷管理', value: '试卷管理'}]; // 所有
  // 侧边栏
  isCollapsed = false;
  triggerTemplate = null;
  @ViewChild('trigger') customTrigger: TemplateRef<void>;
  validateForm: FormGroup;
  // table
  loading = false;
  searchValue = '';
  sortMap = {
    name   : null,
    age    : null,
    password: null
  };
  // 修改用户modal
  isVisible = false;
  isOkLoading = false;
  modal_id = 0;
  modal_username = null;
  modal_password = null;
  modal_age = 0;
  // 资源审批
    // 结果
    approvalResult = '审批通过';
  constructor(private fb: FormBuilder, private userService: UserService,
              private resourceService: ResourceService, private routers: Router) {
    if (localStorage.length <= 0) { alert('请先登录'); this.routers.navigate(['login']); }
    this.validateForm = this.fb.group({
      userName: [ '', [ Validators.required ], [ this.userNameAsyncValidator ] ],
      password: [ '', [ Validators.required ] ],
      confirm : [ '', [ this.confirmValidator ] ]
    });
  }

  ngOnInit() {
    if (sessionStorage.getItem('name') === null && sessionStorage.getItem('id') === null) {
      this.routers.navigate(['login']);
    }
    this.getJur();
    this.getUser();
    this.resourceService.queryAll().subscribe( (re: any ) => {
      this.resource = re;
      const ar = this.resource.find( function (item) {
        return item.isusable === '等待审核';
      } );
      if (ar !== undefined) {
        alert( '存在未审核的资源，请及时审核' );
      }
    });
  }
  // 获取数据
  private getUser(): void {
    const Uid = 1;
    this.userService.queryAllUser().subscribe((re: any[]) => {
      this.user = re; // 获取全部数据
      this.user1 = re;
      this.insertJur(re[re.length - 1].id);
      this.loading = false;
    });
  }
  // get exam
  private getExam(): void {
    this.loading = true;
    this.resourceService.getExam().subscribe((re: any[]) => {
      this.exam = re; // 获取全部数据
      console.log(re);
      this.loading = false;
    });
  }
  // get testPaper
  private getTestPaper(): void {
    this.loading = true;
    this.resourceService.getTestPaper().subscribe((re: any[]) => {
      this.testPaper = re; // 获取全部数据
      for (const i of this.testPaper) {
       this.userService.queryById(i.uid).subscribe((u: User) => {
         i.author = u.loginname;
       });
      }
      console.log(re);
      this.loading = false;
    });
  }
  // 获取所有资源s
  private getResource() {
    this.resourceService.queryAll().subscribe( (re: any ) => {
      this.resource = re;
      this.loading = false;
    });
  }
  // 筛选条件
  private getTheResource(condition: String): void {
    if (this.resource === undefined) {
      console.log('获取资源失败');
      return;
    }
    this.resource1 = this.resource.filter(item => item.isusable === condition);
    this.loading = false;
  }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }

  submitForm = ($event, value) => {
    this.loading = true;
    $event.preventDefault();
    for (const key  in this.validateForm.controls) {
      this.validateForm.controls[ key ].markAsDirty();
      this.validateForm.controls[ key ].updateValueAndValidity();
    }
    // 如果表单验证通过
      this.userService.add(value, this.age).subscribe(data =>  {
        this.getUser();
        this.loading = false;
    });
      this.mode = 'other';
    this.validateForm.reset();
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[ key ].markAsPristine();
      this.validateForm.controls[ key ].updateValueAndValidity();
    }
    this.age = 20;
  }
  // 判断两次输入的密码是否一致
  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }
  // 判断名称是否重复
  userNameAsyncValidator = (control: FormControl) => Observable.create((observer: Observer<ValidationErrors>) => {
    setTimeout(() => {
      for (const u of this.user) {
        if (control.value === u.loginname) {
          observer.next({ error: true, duplicated: true });
          observer.complete();
        } else {
          observer.next(null);
        }
      }
      observer.complete();
    }, 1000);
  })
  confirmValidator = (control: FormControl): { [ s: string ]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
  }
  onInput(value: string): void {
    // 此处是保存过滤后的数据
    let ms: any;
    this.user1 = this.user.filter(item => item.loginname === value);
    for (const u of  this.user1) {
      ms = u.loginname;
    }
    this.options = value ? [
      ms
    ] : [];
  }
  // Usertable操作
  search(): void {
    console.log(this.searchValue);
    if (this.searchValue.trim() === '') {
      this.user1 = this.user;
      console.log(this.user);
    } else {
      this.user1 = this.user.filter(item => item.loginname === this.searchValue);
    }
  }
  delete(id: any): void {
    this.loading = true;
    this.userService.delete(id).subscribe( data => {
      console.log(data);
      this.getUser();
      this.loading = false;
    });
  }
deleteExam(id: any): void {
    this.loading = true;
    this.resourceService.deleteExam(id);
}
deleteTestPaper(id: any): void {
    this.loading = true;
    this.resourceService.deleteTestPaper(id).subscribe( date => {
      console.log(date);
      this.getTestPaper();
      this.loading = false;
    });
  }
  edit(): void {
    if (this.modal_id === 0) {
      const user = new User();
      user.id = this.modal_id;
      user.loginname = this.modal_username;
      user.password = this.modal_password;
      user.age = this.modal_age;
      console.log(user);
      this.userService.update(user).subscribe(data => {
        console.log(data) ;
        this.loading = false;
        // 重新刷新数据
        this.getUser();
      });
      this.loading = true;
    } else {
      alert('修改用户资料失败');
    }
  }

  // 删除资源， 把资源状态变为‘已移除’
  deleteResource(id: number): void {
    this.loading = true;
    const re = new Resource();
    re.id = id;
    re.isusable = '已移除';
    this.resourceService.update(re).subscribe( data => {
      console.log(data);
      this.getResource();
      this.loading = false;
    });
  }
  // 审批资源，变为‘审批通过’或者‘审批未通过’
  editResource(id: number): void {
    this.loading = true;
    const re = new Resource();
    re.id = id;
    re.isusable = this.approvalResult;
    this.resourceService.update(re).subscribe( data => {
      console.log(data);
      this.getResource();
      // get condition
      this.loading = true;
      let u = '';
      if (this.mode === 'draft') {
        u = '等待审核';
      } else if (this.mode === 'deny') {
        u = '下线整改';
      } else if (this.mode === 'deleted') {
        u = '已移除';
      } else if (this.mode === 'approved') {
        u = '审批通过';
      }
      this.getTheResource(u);
      this.loading = false;
      this.isVisible = false;
    });
  }
  // modal
  showModal(): void {
    this.loading = true;
    this.isVisible = true;
    // this.modal_id = data.id;
    // this.modal_username = data.loginname;
    // this.modal_password = data.password;
    // this.modal_age = data.age;
  }
// modal hold condition
  showModa(data: Object): void {
    this.loading = true;
    this.isVisible = true;
    if (data.hasOwnProperty('url')) {
      this.newResource = <Resource>data;
    } else if ( data.hasOwnProperty('loginname')) {
      this.newUser = <User>data;
    } else if (data.hasOwnProperty('a')) {
      this.newExam = <Exam>data;
    } else if (data.hasOwnProperty('difficulty')) {
      this.newTest = <TestPaper>data;
    } else {
      alert('未知错误');
    }
  }
  // 修改数据
  handleOk(data: Object): void {
    if (data.hasOwnProperty('a')) {
      console.log(data);
      this.resourceService.updateExam(<Exam>data).subscribe( re => {
        this.loading = false;
      });
    } else if (data.hasOwnProperty('difficulty')) {
      console.log(data);
      this.resourceService.updateTestPaper(<TestPaper>data).subscribe( re => {
        this.loading = false;
      });
    } else if (data.hasOwnProperty('loginname')) {
      this.userService.update(<User>data).subscribe(re => {
        console.log(re) ;
        this.getUser();
        // 重新刷新数据
        this.loading = false;
      });
    } else if (data.hasOwnProperty('isavailable')) {
      console.log(data);
      // let j = <Jurisdiction>data;
      // j.mode = j.mode.toString();
      this.userService.updateJur(<Jurisdiction>data).subscribe( re => {
        console.log(re);
        this.loading = false;
      });
    } else {
        alert('修改失败');
    }
    this.isVisible = false;
  }
  selectedValuehandleOk(): void {
    this.isOkLoading = true;
    // this.edit();
    window.setTimeout(() => {
      this.isVisible = false;
      this.isOkLoading = false;
    }, 1000);
  }

  private insertJur(uid: number): void {
    if (uid === 1) { return ; }
    this.userService.getJur(uid).subscribe( date => {
      if (date === null) { this.userService.addJur(uid).subscribe( data => {
        console.log(data);
        });
      }
    });
  }
  private getAllJur() {
    this.userService.getAllJur().subscribe( (re: any) => {
      this.jurisdiction = re;
      for (const j of this.jurisdiction) {
        const u = this.user.filter(item => item.id === j.uid);
        j.author = u[0].loginname;
        console.log(j.author);
      }

      this.loading = false;
    });
  }
  handleCancel(): void {
    this.isVisible = false;
    this.loading =     false;
  }

  clean(): void {
    sessionStorage.clear();
}
// 获取登录用户的权限
  private getJur() {
    if (sessionStorage.getItem('type') === 'admin') {
      return;
    }
    this.theJur = sessionStorage.getItem('mode');
    console.log(this.theJur);
  }
  // 判断是否有指定权限
   private Judge(name: string) {
    const type = sessionStorage.getItem('type');
      if (type === 'admin') { return; }
     if (this.theJur.indexOf(name) === -1 ) {
       alert('权限不足！请联系你的管理员申请权限！');
       this.mode = 'null';
     }
   }
}
