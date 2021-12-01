import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('form') form: NgForm;

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';
  userFullImagePath: string;
  private userImagepathSubsription: Subscription;

  constructor(public modalController: ModalController, private authService: AuthService) { }

  ngOnInit() {
    this.userImagepathSubsription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    });
    this.authService.userFullName.pipe(take(1)).subscribe((fullName: string) => {
      this.fullName = fullName;
      this.fullName$.next(fullName);
    });
  }

  onDismiss() {
    this.modalController.dismiss(null, 'dismis');
  }
  onPost() {
    if(!this.form.valid) return;
    const body = this.form.value['body'];

    this.modalController.dismiss({
      post: {
        body: body,
      }
    },'post')
  }

  ngOnDestroy() {
    this.userImagepathSubsription.unsubscribe();
  }

}
