import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {
    constructor(private toastController: ToastController){}

    async presentToast(errorMessage: string) {
        const toast = await this.toastController.create({
            header: 'Error occured',
            message: errorMessage,
            duration: 2000,
            color: 'danger',
            buttons: [
                {
                    role: 'cancel',
                    icon: 'bug',
                    text: 'dismiss'
                }
            ]
        })

        toast.present();
    }
    handlerError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.warn(`${operation} failed: ${error.message}`);
            return of(result as T).pipe(tap(() => this.presentToast(error.message)));
        } 
    }
}