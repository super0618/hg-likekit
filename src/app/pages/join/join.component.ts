import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [MatButtonModule, NgIf],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss',
})
export class JoinComponent {
  @Input() isJoined = false;
  roomName = '';
  participantName = '';

  constructor(private router: Router) {}

  async setRoomName(event: any): Promise<void> {
    this.roomName = event.target.value;
  }

  async setParticipantName(event: any): Promise<void> {
    this.participantName = event.target.value;
  }

  async handleClick(): Promise<void> {
    this.router.navigate([btoa(this.roomName)], {
      state: {
        roomName: this.roomName,
        participantName: this.participantName,
      },
    });
  }
}
