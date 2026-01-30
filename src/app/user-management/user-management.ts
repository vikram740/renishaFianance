import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { Common } from '../service/common';
import { Auth } from '../service/auth';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { toast } from 'ngx-sonner';
import bootstrap from 'bootstrap';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule,MatPaginatorModule,ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {

   users: any[] = [];
  page = 1;
  limit = 10;
  totalCount = 0;
  isLoading = false;
  cdr = inject(ChangeDetectorRef);
  userForm!:FormGroup;
  selectedUserId: string = '';
   dialog = inject(MatDialog);
   private platformId = inject(PLATFORM_ID);

  auth = inject(Auth);

  ngOnInit() {
    this.userForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$")]),
      role: new FormControl('', [Validators.required])
    })
    
    this.loadUsers();
  }

  loadUsers() {
  

    this.auth.userList(this.page, this.limit).subscribe({
      next: (res: any) => {
        this.users = res.data || [];
        console.log('this.users', this.users)
        this.totalCount = res.count || 0;
        this.cdr.detectChanges()
        
      },
      error: () => {
        this.users = [];
        this.totalCount = 0;
      }
    });
  }

  // 🔥 CONNECTS MAT-PAGINATOR
  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadUsers();
  }
  editUser(user: any) {
  this.selectedUserId = user._id;

  this.userForm.patchValue({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role?.toLowerCase() 
  });
   if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        import('bootstrap').then((bootstrap) => {
          const modalEl = document.getElementById('editUserModal');
          if (!modalEl) return;

          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        });
      });
    }
}

saveEdit() {
  if (this.userForm.invalid) return;

  const payload = {
    _id: this.selectedUserId,
    ...this.userForm.value
  };

  this.auth.updateUser(payload).subscribe({
    next: () => {
      toast.success('User updated successfully', { class: 'toast-success' });

      this.loadUsers();
      this.userForm.reset();

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          import('bootstrap').then((bootstrap) => {
            const modalEl = document.getElementById('editUserModal');
            if (!modalEl) return;

            const modal = bootstrap.Modal.getInstance(modalEl);
            modal?.hide(); // ✅ THIS WORKS
          });
        });
      }
    }
  });
}


deleteUser(id: string) {
  this.auth.deleteUser(id).subscribe(() => { 
     toast.success('User deleted successfully', { class: 'toast-success' });
    
    this.loadUsers();
  });
}
openDialog(userId: string): void {
    const dialogRef = this.dialog.open(ConfirmationModal, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteUser(userId);

      } else {
        console.log('Dialog was closed without confirmation');
      }
    });
  }

}
