import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security-group-form.html',
  styleUrls: ['./security-group-form.css']
})
export class SecurityGroupForm {
  securityForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SecurityGroupForm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.securityForm = this.fb.group({
      groupName: [data?.groupName || '', Validators.required],
      description: [data?.description || '', Validators.required]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.securityForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control = this.securityForm.get(field);
    if (control?.hasError('required')) return `${field} is required`;
    return '';
  }

  save() {
    if (this.securityForm.valid) {
      this.dialogRef.close(this.securityForm.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
