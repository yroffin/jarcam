import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolpathViewComponent } from './toolpath-view.component';

describe('ToolpathViewComponent', () => {
  let component: ToolpathViewComponent;
  let fixture: ComponentFixture<ToolpathViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolpathViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolpathViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
