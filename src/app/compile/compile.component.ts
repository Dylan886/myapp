import { Component, OnInit } from '@angular/core';
import {ResourceService} from '../resource.service';
import {Output} from '../model/output';

@Component({
  selector: 'app-compile',
  templateUrl: './compile.component.html',
  styleUrls: ['./compile.component.css']
})
export class CompileComponent implements OnInit {
  compileCode = '   public class Main{\n' +
                 '            public static void main(String args[]){\n' +
                '                System.out.println("请在此处输入您想运行的代码");\n' +
                '              }\n' +
                '   }\n';
  output: Output;
  constructor(private resourceService: ResourceService) { }

  ngOnInit() {
    if (sessionStorage.getItem('code').length > 0 ) {this.compileCode = sessionStorage.getItem('code'); } else {return;}
  }

  compile(): void {
    console.log(this.compileCode)
    this.resourceService.compile(this.compileCode).subscribe(re => {
      console.log(re);
      this.output = re;
      let u = this.output.data.split('&');
      this.output.commsg = u[0];
      this.output.outmsg = u[1];
      this.output.runmsg = u[2];
    });
  }
}
