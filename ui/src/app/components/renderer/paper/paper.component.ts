import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { PaperScope, Project } from 'paper';
import { TreeNode } from 'primeng/api';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';

@AutoUnsubscribe()
@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.css']
})
export class PaperComponent implements OnInit {

  @ViewChild('paperView') paperCanvas: ElementRef;

  scope: PaperScope;
  project: Project;
  @Input() infos: TreeNode[];

  constructor() { }

  ngOnInit() {
    // For using paper libs
    this.scope = new PaperScope();
    this.project = new Project(this.paperCanvas.nativeElement);
  }
}
