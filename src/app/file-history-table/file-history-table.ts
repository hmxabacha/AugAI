import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileHistoryService, StoredFile } from '../services/file.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-file-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-history-table.html',
  styleUrls: ['./file-history-table.css'],
})
export class FileHistoryComponent {
  userId: number | null = null;        // store as number now
  files: StoredFile[] = [];            // use your interface

  constructor(
    private fileHistory: FileHistoryService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.auth.getUserId(); // number or null

    if (this.userId) {
      this.fileHistory.getUserFiles(this.userId).subscribe({
        next: (res: StoredFile[]) => {
          console.log("API Response:", res);
          this.files = res;
        },
        error: (err) => {
          console.error('Failed to load files', err);
          this.files = [];
        }
      });
    }
  }

  reuseFile(file: StoredFile) {
    const event = new CustomEvent('reuseFile', { detail: file });
    window.dispatchEvent(event);
  }

  trackByName(index: number, f: StoredFile) {
    return f.fileName; // assuming StoredFile has `name`
  }
}
