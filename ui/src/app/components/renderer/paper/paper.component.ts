import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
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
  @ViewChild('paperCube') paperCube: ElementRef;

  container: HTMLElement;

  scope: PaperScope;
  project: Project;
  @Input() infos: TreeNode[];
  @Output() zoomin: EventEmitter<any> = new EventEmitter();
  @Output() zoomout: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    // For using paper libs
    this.scope = new PaperScope();
    this.project = new Project(this.paperCanvas.nativeElement);
  }

  private onWheel(event: any) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomout.emit(event);
    } else if (event.deltaY > 0) {
      this.zoomin.emit(event);
    }
  }
}
