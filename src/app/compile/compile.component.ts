import { Component, OnInit } from '@angular/core';
import {ResourceService} from '../resource.service';

@Component({
  selector: 'app-compile',
  templateUrl: './compile.component.html',
  styleUrls: ['./compile.component.css']
})
export class CompileComponent implements OnInit {
  compileCode = 'public class Main{\n' +
    'public static void main(String args[]){\n' +
    '}\n' +
    '}\n';
  constructor(private resourceService: ResourceService) { }

  ngOnInit() {
  }

  compile(): void {
    console.log(this.compileCode)
    this.resourceService.compile(this.compileCode).subscribe(re => {
      console.log(re);
    });
  }
}
