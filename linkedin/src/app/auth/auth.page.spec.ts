import { AuthPage } from './auth.page';
import { ComponentFixture, waitForAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { NewUser } from "./models/newUser.model";
import { User } from "./models/user.model";
import { AuthService } from "./services/auth.service";
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

let component: AuthPage;
let fixture: ComponentFixture<AuthPage>;
let routerSpy: Partial<Router>;

const mockNewUser: NewUser = {
    firstName: 'Miftah',
    lastName: 'Salam',
    email: 'salam.miftah@gmail.com',
    password: '123456' 
}
const mockUser: User = {
    id: 1,
    firstName: mockNewUser.firstName,
    lastName: mockNewUser.lastName,
    email: mockNewUser.email,
    role: 'user',
    imagePath: null,
    posts: null
}
const mockAuthService: Partial<AuthService> = {
    register: () => of(mockUser),
    login: () => of({ token: 'jwt' }),
};

describe("AuthPage", () => {
    beforeEach(
        waitForAsync(() => {
            routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

            TestBed.configureTestingModule({
                imports: [FormsModule, IonicModule],
                declarations: [AuthPage],
                providers: [
                    { provide: Router, useValue: routerSpy },
                    { provide: AuthService, useValue: mockAuthService },
                ],
                schemas: [CUSTOM_ELEMENTS_SCHEMA]
            }).compileComponents();

            fixture = TestBed.createComponent(AuthPage);
            component = fixture.componentInstance;
            fixture.detectChanges();
            component.form = {
                value: mockNewUser,
            } as NgForm;
            fixture.detectChanges();
        })
    );

    it('should create with form values', waitForAsync(() => {
        fixture.whenStable().then(() => {
            expect(component).toBeTruthy();
            console.log(component.form.value);
            
            expect(component.form.value).toEqual(mockNewUser);
        })
    }));
    it("should have initial submission type of login", () => {
        expect(component.submissionType).toEqual('login')
    });
    it("should toggle submission type to join", () => {
        component.toggleText();
        fixture.detectChanges();
        expect(component.submissionType).toEqual('join');
    });
    it("should route to home page upon login", () => {
        expect(component.submissionType).toEqual("login");
        component.onSubmit();

        const spy = routerSpy.navigateByUrl as jasmine.Spy;
        const navArgs = spy.calls.first().args[0];

        expect(navArgs).toBe("/home")
    });
    it('should toggle submission type to login after registering', () => {
        expect(component.submissionType).toEqual('login');
        component.toggleText();
        expect(component.submissionType).toEqual('join');
        component.onSubmit();
        expect(component.submissionType).toEqual('login');
      });
})
