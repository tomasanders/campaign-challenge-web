import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';

import { Participant } from './models/participant.model';
import { ParticipantSignupComponent } from './participant-signup/participant-signup.component';
import { ParticipantApiService } from './services/participant-api.service';

describe('ParticipantSignupComponent', () => {
  let fixture: ComponentFixture<ParticipantSignupComponent>;
  let component: ParticipantSignupComponent;
  let api: jasmine.SpyObj<ParticipantApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ParticipantApiService', ['getParticipants', 'createParticipant']);
    api.getParticipants.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ParticipantSignupComponent],
      providers: [{ provide: ParticipantApiService, useValue: api }]
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

  it('normalizes the payload and refreshes the list after a successful signup', () => {
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
    expect(component.successMessage).toBe('Signup successful (participant id: 1)');
    expect(component.signupForm.getRawValue()).toEqual({
      first_name: '', last_name: '', email: '', age: 13, country_code: '', marketing_opt_in: false
    });
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
