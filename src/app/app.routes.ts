import { Routes } from '@angular/router';
import { JoinComponent } from './pages/join/join.component';
import { RoomComponent } from './pages/room/room.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: JoinComponent,
      },
      {
        path: ':roomId',
        component: RoomComponent,
      },
    ],
  },
];
