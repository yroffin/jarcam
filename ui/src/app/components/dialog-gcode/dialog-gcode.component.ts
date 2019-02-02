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

  @ViewChild('clipboard') code: ElementRef;
  gcode: string;

  constructor(public dialogRef: MatDialogRef<DialogGcodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.gcode = this.data.gcode;
  }

  ngOnInit() {
  }

  /**
   * Cf. http://www.javascriptkit.com/javatutors/copytoclipboard.shtml
   */
  private selectElementText() {
    const range = document.createRange(); // create new range object
    range.selectNodeContents(this.code.nativeElement); // set range to encompass desired element text
    const selection = window.getSelection(); // get Selection object from currently user selected text
    selection.removeAllRanges(); // unselect any user selected text (if any)
    selection.addRange(range); // add range to Selection object to select it
  }

  /**
   * Cf. http://www.javascriptkit.com/javatutors/copytoclipboard.shtml
   */
  private copySelectionText() {
    let copysuccess; // var to check whether execCommand successfully executed
    try {
      copysuccess = document.execCommand('copy'); // run command to copy selected text to clipboard
    } catch (e) {
      copysuccess = false;
    }
    return copysuccess;
  }

  onNoClick(): void {
    this.selectElementText();
    this.copySelectionText();
    this.dialogRef.close();
  }
}
