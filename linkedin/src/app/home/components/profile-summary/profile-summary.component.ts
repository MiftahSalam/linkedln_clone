import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { fromBuffer, FileTypeResult } from 'file-type/core';
import { BehaviorSubject, from, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Role, User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BannerColorService } from '../../services/banner-color.service';

type validFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  form: FormGroup;
  validFileExtensions: validFileExtension[] = ['png', 'jpg', 'jpeg'];
  validMimeTypes: validMimeType[] = ['image/jpeg', 'image/jpg', 'image/png'];
  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';
  userFullImagePath: string;
  private userImagepathSubsription: Subscription;
  private userSubsription: Subscription;

  constructor(private authService: AuthService, public bannerColorsService: BannerColorService) { }

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null)
    });
    this.userImagepathSubsription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    });
    this.userSubsription = this.authService.userStream.subscribe((user: User) => {
      if(user?.role) {
        this.bannerColorsService.bannerColors = this.bannerColorsService.getBannerColor(user.role);
      }
      if(user && user?.firstName && user?.lastName){
        this.fullName = user.firstName + user.lastName;
        this.fullName$.next(this.fullName);
      } 
    })


    // this.authService.userRole.pipe(take(1)).subscribe((role: Role) => {
    //   this.bannerColorsService.bannerColors = this.bannerColorsService.getBannerColor(role);
    // });
    // this.authService.userFullName.pipe(take(1)).subscribe((fullName: string) => {
    //   this.fullName = fullName;
    //   this.fullName$.next(fullName);
    // });
  }

   onFileSelect(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files[0];
    
    if(!file) return;

    const formData = new FormData();
    formData.append('file', file);

    from(file.arrayBuffer()).pipe(
      switchMap((buffer: Buffer) => {
        return from(fromBuffer(buffer)).pipe(
          switchMap((fileTypeResult: FileTypeResult) => {
            if(!fileTypeResult) {
              console.error({ error: "File type not supported!"});
              return of();              
            }

            const { ext, mime } = fileTypeResult;
            const isFileTypeLegit = this.validFileExtensions.includes(ext as any);
            const isMimeTypeLegit = this.validMimeTypes.includes(mime as any);
            const isFileLegit = isFileTypeLegit && isMimeTypeLegit;

            if(!isFileLegit) {
              console.error({ error: "File format does not match file extension!"});
            }

            return this.authService.uploadUserImage(formData);
          })
        )
      })
    ).subscribe();

    this.form.reset();
  }

  ngOnDestroy() {
    this.userImagepathSubsription.unsubscribe();
  }

}
