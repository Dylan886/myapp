import {Component, OnInit} from '@angular/core';
import {Resource} from '../model/Resource';
import {ResourceService} from '../resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../model/User';
import {HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse} from '@angular/common/http';
import {forkJoin} from 'rxjs';
import {NzMessageService, UploadXHRArgs} from 'ng-zorro-antd';
import {Exam} from '../model/exam';
import {UserService} from '../user.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {TestPaper} from '../model/TestPaper';

type MODE = 'fundament'|'advanced'|'example'|'main'|'addition'|'resource'|'exam'|'change';
type Answer= 'A'|'B'|'C'|'D';
// 基础，进阶，实例，主页，拓展，资源（上传），测试,修改密码
/*"fundament" 是基础知识中判断选择什么知识点*/
type TYPE = 'edit'|'finish';
/* 知识点提供在线编写功能*/
type CHOOSE = 'exam'|'test';
/*试卷，题目*/


@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {
  Answer: string;

  resource: Resource[];
  // 初始化模块选择
  MODE: MODE = 'main';
  TYPE: TYPE = 'finish';
  CHOOSE: CHOOSE = 'test';
  // 异步加载
  loading = true;
  // 抽屉
  visible = false;
  Pvisible = false;
  author = '';
  url = '';
  resourceName = '';
  theModelName = '知识点';
  // 用户信息
  user: User = new User();
  username: string = null;
  password: string = null;
  // 用户上传资源
  theResource = [];
  // exam
  exam: Exam[];
  testPaperList: TestPaper[];
  // 进阶知识内容展示
  sider = [];
  // 渲染数据
  title: String;
  inputValue = 'Switch tab view preview @NG-ZORRO ';
  preview: SafeHtml;
  suggestions = ['NG-ZORRO', 'angular', 'Reactive-Extensions'];
  // 编译代码
  compileCode: String;
  // 主页展示的知识点
  newResource = [];
  // 加载modal
  isVisible = false;
  // 试卷modal                    // 题目modal
  selectedValue = ''; // 难度         // 题型
  multipleValue = []; // 选中
  listOfOption = []; // 所有
  examName = ''; // 名称
  remark = ''; // 备注
  // 题目modal
  examModal: Exam = new Exam();
  // 选中考卷
  theTest: Exam[] = [];
  // 是否开启编辑
  isEdit = false;
  // 选择题目
  isTest = false;
  constructor(private userService: UserService, private http: HttpClient, private msg: NzMessageService,
              private resourceService: ResourceService, public _activeRouter: ActivatedRoute,
              private routers: Router, private sanitizer: DomSanitizer) {
  if (localStorage.length <= 0) { alert('请先登录'); this.routers.navigate(['login']); }
  }

  ngOnInit() {
    if (sessionStorage.getItem('name') === null && sessionStorage.getItem('id') === null) {
      this.routers.navigate(['login']);
    }

    this.getResource();

    // 用户参数
    this.username = sessionStorage.getItem('name');
    this.user.loginname = this.username;
    this.user.id =  parseInt(sessionStorage.getItem('id'), 10);
    this.author = this.username;
    this.user.type = sessionStorage.getItem('type');

    // 获取对应知识内容
    this.getText('OracleJDK和OpenJDK的对比.txt');

  }

  // get exam
  private getExam(): void {
    this.loading = true;
    this.resourceService.getExam().subscribe((re: any[]) => {
      this.exam = re; // 获取全部数据
      console.log(re);
      // 题目选择器数据准备
      const children = [];
      for (const c of this.exam) {
        children.push({ label: c.question, value: c.id});
      }
      this.listOfOption = children;

      this.loading = false;
    });
  }
  // get testPaper
  private getTestPaper(): void {
    this.loading = true;
    this.resourceService.getTestPaper().subscribe((re: any[]) => {
      this.testPaperList = re; // 获取全部数据
      for (const i of this.testPaperList) {
        this.userService.queryById(i.uid).subscribe((u: User) => {
          i.author = u.loginname;
        });
      }
      console.log(re);
      this.loading = false;
    });
  }
  // 显示报错信息
  log(value: string[]): void {
    console.log(value);
  }

  // 获取全部资源
  private getResource() {
    this.resourceService.queryAll().subscribe((re: any) => {
      this.resource = re;
      console.log(this.resource);
      // 获取侧边栏
      for (const r of this.resource) {
        this.sider.push(r.resourcename);
      }
      console.log(this.sider);
      // 获取用户(教师自己)上传的资源
      this.getTheResource('all');
      // 获取最新的三个资源展示在主页
      this.getNewResource();
    });
  }

    // 获取我的资源
  private getTheResource(type: string): void {
    // console.log(type);
    this.loading = true;
    if ( type === 'my') {
      // console.log(typeof(this.user.id));
      for (const u of this.resource) {
        console.log(typeof (u.uid));
      }
      this.theResource = this.resource.filter(item => item.uid.toString() === this.user.id.toString() );
      this.loading = false;
    } else {
      this.theResource = this.resource.filter(item => item.isusable === '审批通过');
      this.loading = false;
    }
  }
  // 获取最新的三个资源展示在主页
  private getNewResource(): void {
    this.newResource.fill(this.resource, this.resource.length - 3, this.resource.length - 1);
  }
  // marketdown
  private getText(fileName: string) {
    // 文本内容
    console.log(fileName);
    return this.resourceService.getText(fileName)
      .subscribe((re: any) => {
        this.inputValue = re;
        // 渲染数据
        const str = fileName.split('.');
        this.title = str[0];
        this.renderPreView();
      });

  }

  // 抽屉
  open(): void {
    this.visible = true;
  }
  close(): void {
    this.Pvisible = false;
    this.visible = false;
    this.clear();
  }

  // upload
  customReq = (item: UploadXHRArgs) => {
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    // console.log(item.file.name);
    // 此处获取上传文件的数据
    const str = item.file.name.split('.');
    this.resourceName = str[0];
    this.url = item.file.name;
    // tslint:disable-next-line:no-any
    formData.append('fileName', item.file as any);
    formData.append('id', '1000');
    const req = new HttpRequest('POST', item.action, formData, {
      reportProgress : true,
      withCredentials: true
    });
    // 始终返回一个 `Subscription` 对象，nz-upload 会在适当时机自动取消订阅
    return this.http.request(req).subscribe((event: HttpEvent<{}>) => {
      if (event.type === HttpEventType.UploadProgress) {
        if (event.total > 0) {
          // tslint:disable-next-line:no-any
          (event as any).percent = event.loaded / event.total * 100;
        }
        // 处理上传进度条，必须指定 `percent` 属性来表示进度
        item.onProgress(event, item.file);
      } else if (event instanceof HttpResponse) {
        // 处理成功
        //   此处进行数据库
        item.onSuccess(event.body, item.file, event);
      }
    }, (err) => {
      // 处理失败
      item.onError(err, item.file);
    });
  }

  // 一个简单的分片上传
  customBigReq = (item: UploadXHRArgs) => {
    const size = item.file.size;
    const chunkSize = parseInt((size / 3) + '', 10);
    const maxChunk = Math.ceil(size / chunkSize);
    const reqs = Array(maxChunk).fill(0).map((v: {}, index: number) => {
      const start = index * chunkSize;
      let end = start + chunkSize;
      if (size - end < 0) {
        end = size;
      }
      const formData = new FormData();
      formData.append('file', item.file.slice(start, end));
      formData.append('start', start.toString());
      formData.append('end', end.toString());
      formData.append('index', index.toString());
      const req = new HttpRequest('POST', item.action, formData, {
        withCredentials: true
      });
      return this.http.request(req);
    });
    return forkJoin(...reqs).subscribe(resules => {
      // 处理成功
      item.onSuccess({}, item.file, event);
    }, (err) => {
      // 处理失败
      item.onError(err, item.file);
    });
  }

  // 存入数据库
  upload(): void {
    if (!(this.author.length > 0 && this.resourceName.length > 0 && this.url.length > 0)) {
      return;
    }
    this.resourceService.upload(this.user.id, this.author,
                                this.resourceName, this.theModelName, this.url);
    alert('上传成功');
    this.close();
    this.clear();
  }

  // 清理缓存数据
  clear(): void {
    this.author = '';
    this.url = '';
    this.resourceName = '';
    this.selectedValue = '';
    this.multipleValue = [];
    this.remark = '';
    this.examName = '';
  }

  // 修改password
  update() {
    let u = new User();
    u.id = this.user.id;
    u.password = this.user.password;
    this.userService.update(u).subscribe( data => {
      console.log(data);
      this.user.password = '';
    });
  }

  // 渲染数据
  getRegExp(prefix: string | string[]): RegExp {
    const prefixArray = Array.isArray(prefix) ? prefix : [prefix];
    let prefixToken = prefixArray.join('').replace(/(\$|\^)/g, '\\$1');

    if (prefixArray.length > 1) {
      prefixToken = `[${prefixToken}]`;
    }

    return new RegExp(`(\\s|^)(${prefixToken})[^\\s]*`, 'g');
  }
  renderPreView(): void {
    if (this.inputValue) {
      const regex = this.getRegExp('@');
      const previewValue = this.inputValue.replace(
        regex,
        match => `<a target="_blank" href="https://github.com/${match.trim().substring(1)}">${match}</a>`
      );
      this.preview = this.sanitizer.bypassSecurityTrustHtml(previewValue);
    }
  }

  // 当侧边栏选中某一项
  changeSelected(selected: String ): void {
    const re = this.resource.filter( item => item.resourcename === selected );
    // 重新渲染
    this.getText(re[0].resourcename + '.txt');
  }
// Modal
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.examModal.question !== '') { // 新增题目
      console.log(this.examModal);
      this.insertExam();
    } else { // 新增试卷
      this.insertTestPaper();
    }
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  private insertTestPaper() {
    const test = new TestPaper();
    // this.user.id, this.examName, this.selectedValue, this.multipleValue.toString(), this.remark
    test.name = this.examName;
    test.uid = this.user.id;
    test.exam = this.multipleValue.toString();
    test.difficulty = this.selectedValue;
    test.remark = this.remark;
    this.resourceService.insertTestPaper(test).subscribe( re => {
      this.clear();
    });
  }

  private insertExam() {
    this.resourceService.insertExam(this.examModal).subscribe( re => {
      this.clear();
    });
  }

  private setTheTest(id: number) {
    // 获取试卷包括的题目
    const exam = this.testPaperList.filter(item => item.id === id);
    const u = exam[0].exam.split(',');
    for (const i of u) {
      const a = this.exam.filter(item => item.id.toString() === i);
      this.theTest.push(a[0]);
    }
    console.log(this.theTest);
    this.loading = false;
  }
  private getGrade() {
    this.resourceService.getGrade(this.theTest).subscribe( re => {
      alert(re);
      console.log(re);
      this.isTest = false;
      this.theTest = [];
    });
  }
}


