import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Avatar, AvatarService } from '../../services/avatar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-avatar-selector',
  templateUrl: './avatar-selector.component.html',
  styleUrls: ['./avatar-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class AvatarSelectorComponent implements OnInit {
  avatars$: Observable<Avatar[]>;
  selectedAvatar: string | null;
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<AvatarSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentAvatar: string | undefined },
    private avatarService: AvatarService
  ) {
    this.selectedAvatar = data.currentAvatar || null;
    this.avatars$ = this.avatarService.getAvailableAvatars();
  }

  ngOnInit(): void {
    this.avatars$.subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
  }

  selectAvatar(avatarUrl: string): void {
    this.selectedAvatar = avatarUrl;
  }

  onSave(): void {
    this.dialogRef.close(this.selectedAvatar);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
