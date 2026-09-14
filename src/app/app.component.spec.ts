import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';

import { Participant } from './models/participant.model';
import { ParticipantSignupComponent } from './participant-signup/participant-signup.component';
import { ParticipantApiService } from './services/participant-api.service';

describe('ParticipantSignupComponent', () => {
  let fixture: ComponentFixture<ParticipantSignupComponent>;
  let component: ParticipantSignupComponent;
  let api: jasmine.SpyObj<ParticipantApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ParticipantApiService', ['getParticipants', 'createParticipant']);
    api.getParticipants.and.returnValue(of([]));
    router = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [ParticipantSignupComponent],
      providers: [
        { provide: ParticipantApiService, useValue: api },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ParticipantSignupComponent);
    component = fixture.componentInstance;
  });

  it('validates names, age, country code, email, and the required fields', () => {
    component.signupForm.setValue({
      first_name: 'A', last_name: '123', email: 'invalid', age: 12,
      country_code: 'USA', marketing_opt_in: false
    });
    component.submit();

    expect(component.signupForm.invalid).toBeTrue();
    expect(component.signupForm.get('first_name')?.hasError('minlength')).toBeTrue();
    expect(component.signupForm.get('last_name')?.hasError('nameFormat')).toBeTrue();
    expect(component.signupForm.get('email')?.hasError('email')).toBeTrue();
    expect(component.signupForm.get('age')?.hasError('min')).toBeTrue();
    expect(component.signupForm.get('country_code')?.hasError('pattern')).toBeTrue();
    expect(api.createParticipant).not.toHaveBeenCalled();
  });

  it('normalizes the payload and navigates to the game after a successful signup', () => {
    component.signupForm.setValue({
      first_name: ' Ava ', last_name: 'Martinez', email: ' AVA@EXAMPLE.COM ', age: 29,
      country_code: ' us ', marketing_opt_in: false
    });
    api.createParticipant.and.returnValue(of({ participant: { ...component.signupForm.getRawValue(), id: 1 }, message: 'Signup successful' }));
    component.submit();

    expect(api.createParticipant).toHaveBeenCalledWith({
      first_name: 'Ava', last_name: 'Martinez', email: 'ava@example.com', age: 29,
      country_code: 'US', marketing_opt_in: false
    });
    expect(router.navigate).toHaveBeenCalledWith(['/game', 1]);
  });

  it('maps Rails validation errors to fields and blocks duplicate submissions', () => {
    const request = new Subject<{ participant: Participant; message: string }>();
    api.createParticipant.and.returnValue(request.asObservable());
    component.signupForm.patchValue({ first_name: 'Ava', last_name: 'Martinez', email: 'ava@example.com', age: 29, country_code: 'US' });

    component.submit();
    component.submit();
    expect(api.createParticipant).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBeTrue();

    request.error(new HttpErrorResponse({ status: 422, error: { errors: { email: ['is invalid'], age: ['must be less than or equal to 120'] } } }));
    expect(component.isSubmitting).toBeFalse();
    expect(component.messagesFor('email')).toEqual(['is invalid']);
    expect(component.signupForm.get('email')?.hasError('backend')).toBeTrue();
  });

});
