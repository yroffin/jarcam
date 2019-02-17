import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { ParametersService, ParametersBean } from 'src/app/stores/parameters.service';
import { Subscription, Observable } from 'rxjs';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';

export interface Parameters {
  name;
  value;
  description;
}

@AutoUnsubscribe()
@Component({
  selector: 'app-parameters-gcode',
  templateUrl: './dialog-parameters.component.html',
  styleUrls: ['./dialog-parameters.component.css']
})
export class DialogParametersComponent implements OnInit {

  private parameterTable = [
  ];

  parameters: ParametersBean;
  parametersStream: Observable<ParametersBean>;
  parametersSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private parametersService: ParametersService,
    private dialogRef: MatDialogRef<DialogParametersComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.parametersStream = this.parametersService.parameters();
    this.parametersSubscription = this.parametersStream.subscribe(
      (parameters: ParametersBean) => {
        this.parameterTable = [];
        _.each(parameters, (v, k) => {
          this.parameterTable.push({
            name: k,
            value: v
          });
        });
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getSvg(): Observable<any> {
    return this.http.get('assets/data.svg', {responseType: 'text'});
  }
}
