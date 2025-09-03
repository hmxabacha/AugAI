import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface DeleteDialogData {
  title: string;
  message: string;
  itemName: string;
  itemType: string;
}

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon class="warning-icon">warning</mat-icon>
        </div>
        <h2 class="dialog-title">{{ data.title }}</h2>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <p class="dialog-message">{{ data.message }}</p>
        <div class="item-info">
          <span class="item-label">{{ data.itemType }}:</span>
          <span class="item-name">{{ data.itemName }}</span>
        </div>
        <div class="warning-text">
          <mat-icon class="small-icon">info</mat-icon>
          This action cannot be undone.
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button
          mat-button
          class="cancel-button"
          (click)="onCancel()"
          type="button"
        >
          Cancel
        </button>

        <button
          mat-raised-button
          class="delete-button"
          (click)="onConfirm()"
          type="button"
        >
          <mat-icon>delete</mat-icon>
          Delete {{ data.itemType }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog-container {
      padding: 0;
      max-width: 400px;
      font-family: 'Roboto', sans-serif;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .header-icon {
      margin-right: 16px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .dialog-content {
      padding: 24px;
    }

    .dialog-message {
      font-size: 16px;
      color: #555;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .item-info {
      background: #f5f5f5;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 16px 0;
      border-left: 4px solid #ff9800;
    }

    .item-label {
      font-weight: 500;
      color: #666;
      margin-right: 8px;
    }

    .item-name {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }

    .warning-text {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 14px;
      margin-top: 16px;
    }

    .small-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 8px;
      color: #2196f3;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .cancel-button {
      color: #666;
      background: transparent;
      border: 1px solid #ddd;
      min-width: 80px;
    }

    .cancel-button:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    .delete-button {
      background: #f44336;
      color: white;
      min-width: 120px;
      font-weight: 500;
    }

    .delete-button:hover {
      background: #d32f2f;
    }

    .delete-button mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Animation */
    .delete-dialog-container {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .delete-dialog-container {
        max-width: 90vw;
      }

      .dialog-actions {
        flex-direction: column;
      }

      .cancel-button,
      .delete-button {
        width: 100%;
        margin: 4px 0;
      }
    }
  `]
})
export class DeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
