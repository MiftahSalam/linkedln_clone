import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { NewUser } from "../models/newUser.model"
import { User } from "../models/user.model";
import { AuthService } from "./auth.service";

let httpClientSpy: { post: jasmine.Spy};
let authService: AuthService;
let routerSpy: Partial<Router>;
const mockNewUser: NewUser = {
    firstName: 'Miftah',
    lastName: 'Salam',
    email: 'salam.miftah@gmail.com',
    password: '123456' 
}

beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient',['post']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    authService = new AuthService(httpClientSpy as any, routerSpy as any);
})

describe('AuthService', () => {
    describe('register', () => {
        it('should return the user', (done: DoneFn) => {
            const expectedUser: User = {
                id: 1,
                firstName: 'Miftah',
                lastName: 'Salam',
                email: 'salam.miftah@gmail.com',
                role: 'user',
                imagePath: null,
                posts: null
            }

            httpClientSpy.post.and.returnValue(of(expectedUser));
            authService.register(mockNewUser).subscribe((user: User) => {
                expect(typeof user.id).toBe('number')
                expect(user.firstName).toEqual(mockNewUser.firstName);
                expect(user.lastName).toEqual(mockNewUser.lastName);
                expect(user.email).toEqual(mockNewUser.email);
                expect(user.role).toEqual('user');
                expect(user.imagePath).toBeNull();
                expect(user.posts).toBeNull();
                expect((user as any).password).toBeUndefined();

                done();
            });
            expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
        });

        it('should return an error if email already exists', (done: DoneFn) => {
            const errorResponse = new HttpErrorResponse({
                error: 'An user has already created with this email address',
                status: 400,
            });

            httpClientSpy.post.and.returnValue(throwError(errorResponse));
            authService.register(mockNewUser).subscribe({
                next: () => {
                    done.fail('expected a bad request error');
                },
                error: (httpErrorResponse: HttpErrorResponse) => {                    
                    expect(httpErrorResponse.error).toContain('already created');
                    done();
                },
            })
        })
    })
})