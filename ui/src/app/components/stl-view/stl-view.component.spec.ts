import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StlViewComponent } from './stl-view.component';

describe('StlViewComponent', () => {
  let component: StlViewComponent;
  let fixture: ComponentFixture<StlViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StlViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StlViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
