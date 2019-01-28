import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var Prism: any;

Prism.languages.gcode = {
  'comment': /;.*|\B\(.*?\)\B/,
  'string': {
    pattern: /"(?:""|[^"])*"/,
    greedy: true
  },
  'keyword': /\b[GM]\d+(?:\.\d+)?\b/,
  'property': /\b[A-Z]/,
  'checksum': {
    pattern: /\*\d+/,
    alias: 'punctuation'
  },
  // T0:0:0
  'punctuation': /:/
};

@Component({
  selector: 'app-dialog-gcode',
  templateUrl: './dialog-gcode.component.html',
  styleUrls: ['./dialog-gcode.component.css']
})
export class DialogGcodeComponent implements OnInit {

  gcode: string;

  constructor(public dialogRef: MatDialogRef<DialogGcodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.gcode = this.data.gcode;
    }

  ngOnInit() {
    this.gcode = Prism.highlight(this.data.gcode, Prism.languages.gcode, 'gcode');
    console.log('gcode', this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
