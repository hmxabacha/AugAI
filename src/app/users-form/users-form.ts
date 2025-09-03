
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface UserDialogData {
  user: any;
  securityGroups: any[];
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './users-form.html',
  styleUrls: ['./users-form.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      groupName: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.isEditMode = !!this.data?.user;
  }

  ngOnInit() {
    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue({
        userName: this.data.user.userName,
        email: this.data.user.email,
        groupName: this.data.user.securityGroup?.groupName || ''
      });

    }
  }



  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      const { confirmPassword, ...submitData } = formData;

      if (this.isEditMode && !submitData.password) {
        delete submitData.password;
      }

      this.dialogRef?.close(submitData);
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.dialogRef?.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      userName: 'Employee Name',
      email: 'Email',
      groupName: 'Security Group',
      password: 'Password',
    };
    return labels[fieldName] || fieldName;
  }

  isFormInvalid(): boolean {
    return this.userForm.invalid || this.userForm.errors?.['passwordMismatch'];
  }

  // getFormError(): string {
  //   if (this.userForm.errors?.['passwordMismatch']) {
  //     return 'Passwords do not match';
  //   }
  //   return '';
  // }
}

