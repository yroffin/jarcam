import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGcodeComponent } from './dialog-gcode.component';

describe('DialogGcodeComponent', () => {
  let component: DialogGcodeComponent;
  let fixture: ComponentFixture<DialogGcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogGcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
