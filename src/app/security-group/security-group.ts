import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SecurityGroupForm } from '../security-group-form/security-group-form';
import { DeleteConfirmationDialog } from '../delete-confirmation/delete-confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-security-group',
  imports: [NgxDatatableModule, FormsModule],
  templateUrl: './security-group.html',
  styleUrl: './security-group.css'
})
export class SecurityGroup {
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  rows: any[] = [];
  columns = [
    { name: 'Group Name', prop: 'groupName' },
    { name: 'Description', prop: 'description' }
  ];
  searchTerm: string = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  pageSize = 5;

  constructor(private dialog: MatDialog, private http: HttpClient,private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadData();

  }
  showAlert(msg : string) {
    this.snackBar.open(msg, 'Close', {
      duration: 3000, // auto close after 3 sec
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'] // custom style
    });
  }
  loadData() {
    this.http.get<any[]>('http://localhost:5077/api/securitygroups')
      .subscribe(data => {
        this.rows = data;
        this.allUsers = data;
        this.filteredUsers = [...data];
      });
  }

  addSecurityGroup() {
    const dialogRef = this.dialog.open(SecurityGroupForm, { width: '400px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('http://localhost:5077/api/securitygroups', result).subscribe({
          next: (res: any) => {
            this.allUsers.push(res);
            this.filteredUsers = [...this.allUsers];
            this.showAlert('Security Group Added Succesfully !');
          },
          error: err => {
            console.error('Error:', err);
          }
        });
      }
    });
  }

  editSecurityGroup(group: any) {
    const dialogRef = this.dialog.open(SecurityGroupForm, {
      width: '400px',
      data: group
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedGroup = { ...group, ...result };
        this.http.put(`http://localhost:5077/api/securitygroups/${group.sqId}`, updatedGroup)
          .subscribe({
            next: () => {
              const index = this.allUsers.findIndex(r => r.sqId === group.sqId);
              if (index !== -1) {
                this.allUsers[index] = updatedGroup;
                this.filteredUsers = [...this.allUsers];
                this.showAlert('Security Group Edited Succesfully !');
              }

            },
            error: err => {
              console.error('Error:', err);
            }
          });
      }
    });
  }

  delete(row: any) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Delete Security Group',
        message: 'Are you sure you want to delete this security group? This may affect users assigned to this group.',
        itemName: row.groupName,
        itemType: 'Security Group'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.http.delete(`http://localhost:5077/api/securitygroups/${row.sqId}`)
          .subscribe({
            next: () => {
              this.allUsers = this.allUsers.filter(r => r.sqId !== row.sqId);
              this.filteredUsers = [...this.allUsers];
            },
            error: err => {
              console.error('Error:', err);
            }
          });
      }
    });
  }

  updateFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.sqId?.toString().includes(term) ||
      user.groupName?.toLowerCase().includes(term) ||
      user.description?.toLowerCase().includes(term)
    );
  }
}
