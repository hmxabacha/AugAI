import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from "@swimlane/ngx-datatable";
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserFormComponent } from '../users-form/users-form';
import { DeleteConfirmationDialog } from '../delete-confirmation/delete-confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  imports: [DatatableComponent, NgxDatatableModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  rows: any[] = [];
  columns = [
    { name: "Employee Name", prop: "userName" },
    { name: "Security Group", prop: "securityGroup.groupName" },
    { name: "Email", prop: "email" },
    { name: "Actions" }
  ];

  searchTerm: string = '';
  filteredUsers: any[] = [];
  allUsers: any[] = [];
  pagedRows: any[] = [];     // current page data
  pageSize = 5;
  currentPage = 0;
  totalElements = 0;
  allSecurityGroups: any[] = [];

  constructor(private dialog: MatDialog, private http: HttpClient, private snackBar : MatSnackBar) {}

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
    // Load security groups first
    this.http.get<any[]>('http://localhost:5077/api/securitygroups')
      .subscribe(securityGroups => {
        this.allSecurityGroups = securityGroups;

        // Then load users
        this.loadUsers();
      });
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:5077/api/users')
      .subscribe(users => {
        // Ensure each user has populated security group data
        this.allUsers = users.map(user => {
          if (user.sqId && !user.securityGroup) {
            const securityGroup = this.allSecurityGroups.find(sg => sg.sqId === user.sqId);
            return { ...user, securityGroup: securityGroup };
          }
          return user;
        });

        this.filteredUsers = [...this.allUsers];
        this.rows = [...this.allUsers];
        this.totalElements = this.allUsers.length;
        this.updatePagedRows();
      });
  }

  onPage(event: any) {
    this.currentPage = event.offset;
    this.updatePagedRows();
  }

  updatePagedRows() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRows = this.rows.slice(start, end);
  }

  addUser() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '400px',
      data: { user: null, securityGroups: this.allSecurityGroups }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Find sqId from selected groupName
        const selectedGroup = this.allSecurityGroups.find(g => g.groupName === result.groupName);
        if (!selectedGroup) {
          return;
        }

        const payload = {
          ...result,
          sqId: selectedGroup.sqId
        };

        this.http.post('http://localhost:5077/api/users', payload).subscribe({
          next: (newUserFromServer: any) => {
            // If server doesn't return populated security group, manually populate it
            if (!newUserFromServer.securityGroup) {
              newUserFromServer.securityGroup = selectedGroup;
            }

            this.allUsers.push(newUserFromServer);
            this.filteredUsers = [...this.allUsers];
            this.rows = [...this.allUsers];
            this.totalElements = this.allUsers.length;
            this.updatePagedRows();
            this.showAlert("User Added Successfully !")
          },
          error: err => {
            console.error('Error:', err);
          }
        });
      }
    });
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '400px',
      data: { user: user, securityGroups: this.allSecurityGroups }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedGroup = this.allSecurityGroups.find(g => g.groupName === result.groupName);
        if (!selectedGroup) {
          return;
        }

        const payload = {
          ...result,
          sqId: selectedGroup.sqId
        };

        const updatedUser = { ...user, ...payload };
        this.http.put(`http://localhost:5077/api/users/${user.id}`, updatedUser)
          .subscribe({
            next: () => {
              const index = this.allUsers.findIndex(r => r.id === user.id);
              if (index !== -1) {
                this.allUsers[index] = updatedUser;
                this.filteredUsers = [...this.allUsers];
                this.rows = [...this.allUsers];
                this.updatePagedRows();
              }
              this.loadData();
              this.showAlert("User Edited Successfully !")
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
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This will remove all user data and access permissions.',
        itemName: row.userName,
        itemType: 'User'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.http.delete(`http://localhost:5077/api/users/${row.id}`)
          .subscribe({
            next: () => {
              this.allUsers = this.allUsers.filter(r => r.id !== row.id);
              this.filteredUsers = [...this.allUsers];
              this.rows = [...this.allUsers];
              this.totalElements = this.allUsers.length;

              // Adjust current page if needed
              const maxPage = Math.ceil(this.totalElements / this.pageSize) - 1;
              if (this.currentPage > maxPage && maxPage >= 0) {
                this.currentPage = maxPage;
              }

              this.updatePagedRows();
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
      user.userName?.toString().includes(term) ||
      user.securityGroup?.groupName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
    this.rows = [...this.filteredUsers];
    this.totalElements = this.filteredUsers.length;
    this.currentPage = 0; // Reset to first page when filtering
    this.updatePagedRows();
  }
}
