import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  CreateParticipantPayload,
  RailsValidationErrors
} from '../models/participant.model';
import { ParticipantApiService } from '../services/participant-api.service';

function nameValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  return value && !/^[\p{L}][\p{L} '\-]*[\p{L}]$/u.test(value)
    ? { nameFormat: true }
    : null;
}

function integerValidator(control: AbstractControl): ValidationErrors | null {
  return Number.isInteger(Number(control.value)) ? null : { integer: true };
}

@Component({
  selector: 'app-participant-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './participant-signup.component.html',
  styleUrl: './participant-signup.component.css'
})
export class ParticipantSignupComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(ParticipantApiService);

  readonly signupForm = this.formBuilder.nonNullable.group({
    first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator]],
    last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator]],
    email: ['', [Validators.required, Validators.email]],
    age: [13, [Validators.required, integerValidator, Validators.min(13), Validators.max(120)]],
    country_code: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
    marketing_opt_in: [false]
  });

  isSubmitting = false;
  submitError = '';
  successMessage = '';
  fieldErrors: Record<string, string[]> = {};

  submit(): void {
    this.successMessage = '';
    this.submitError = '';
    this.fieldErrors = {};

    if (this.isSubmitting) {
      return;
    }

    this.normalizeFormValues();

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.api.createParticipant(this.toPayload()).subscribe({
      next: (response) => {
        this.successMessage = `${response.message || 'Signup successful'} (participant id: ${response.participant.id})`;
        this.signupForm.reset({ age: 13, marketing_opt_in: false });
        this.isSubmitting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 422 && error.error?.errors) {
          this.fieldErrors = (error.error as RailsValidationErrors).errors;
          Object.keys(this.fieldErrors).forEach((field) => this.signupForm.get(field)?.setErrors({ backend: true }));
        } else {
          this.submitError = 'We could not complete your signup. Please check your connection and try again.';
        }
      }
    });
  }

  startAnotherSignup(): void {
    this.successMessage = '';
    this.submitError = '';
    this.fieldErrors = {};
  }

  hasError(field: string, error: string): boolean {
    const control = this.signupForm.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  messagesFor(field: string): string[] {
    return this.fieldErrors[field] ?? [];
  }

  private toPayload(): CreateParticipantPayload {
    const value = this.signupForm.getRawValue();
    return {
      first_name: value.first_name,
      last_name: value.last_name,
      email: value.email,
      age: Number(value.age),
      country_code: value.country_code,
      marketing_opt_in: value.marketing_opt_in === true
    };
  }

  private normalizeFormValues(): void {
    const value = this.signupForm.getRawValue();
    this.signupForm.patchValue({
      first_name: value.first_name.trim(),
      last_name: value.last_name.trim(),
      email: value.email.trim().toLowerCase(),
      country_code: value.country_code.trim().toUpperCase()
    });
  }
}
