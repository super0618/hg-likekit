import {
  Component,
  HostListener,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ContactListItemComponent } from '../../components/contactlistitem/contactlistitem.component';
import {
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  VideoPresets,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from 'livekit-client';
import config from '../../../../config';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    ContactListItemComponent,
    NgIf,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements OnInit, OnDestroy {
  isJoined = false;
  fullscreenMode = false;
  sideTabVisible = false;
  roomName = '';
  participantName = '';
  roomTime = '';

  @Input() socket = '';
  ws: WebSocket | null = null;
  connectionRetry = 0;
  connectionTimeout = 1000;
  state = 'connecting';

  @Output() onConnectionChangeSocket = new EventEmitter();

  @ViewChild('mainView') mainViewRef: ElementRef | null = null;
  @ViewChild('screenContainer') screenContainerRef: ElementRef | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    try {
      this.roomName =
        this.router.getCurrentNavigation()?.extras.state!['roomName'];
      this.participantName =
        this.router.getCurrentNavigation()?.extras.state!['participantName'];
      this.isJoined = true;
    } catch (err: any) {
      try {
        this.roomName = atob(
          this.route.snapshot.paramMap.get('roomId') as string
        );
        this.isJoined = false;
      } catch (err: any) {
        this.router.navigate(['/']);
      }
    }
    this.roomTime = new Date().toDateString();
  }

  async ngOnInit(): Promise<void> {
    // this.setupWS();
  }

  async ngOnDestroy(): Promise<void> {
    // this.ws?.close();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (!this.isJoined) return;

    this.fitScreenPos();
  }

  async setParticipantName(event: any): Promise<void> {
    this.participantName = event.target.value;
  }

  async handleJoin(): Promise<void> {
    this.isJoined = true;
  }

  async setupWS() {
    if (!this.socket?.trim()?.length) {
      return;
    }
    const backend = new URL(config.VOICE_URL);
    const wsPath = `${backend.protocol === 'https:' ? 'wss:' : 'ws:'}//${
      backend.host
    }${this.socket}`;
    const ws = new WebSocket(wsPath);
    ws.addEventListener('message', (message) => {
      try {
        const data = JSON.parse(message.data);
        this.onMessage(data);
      } catch (e) {
        console.info({ message, e }, 'bad data');
      }
    });
    ws.addEventListener('error', (error) => {
      console.info({ error }, 'WebSocket error');
      this.onConnectionChange('closed', error);
    });
    ws.addEventListener('close', (close) => {
      console.info({ close }, 'WebSocket close');
      this.onConnectionChange('closed', close);
    });
    ws.addEventListener('open', (open) => {
      console.info({ open }, 'WebSocket open');
      this.onConnectionChange('connected', open);
    });
    this.ws = ws;
    this.checkWebSocketState(ws);
    this.connectionRetry++;
  }

  async onMessage(message: any) {
    console.info({ message }, 'got message');
  }

  async onConnectionChange(state: any, data: any) {
    this.state = state;
    this.onConnectionChangeSocket.emit({
      state,
      data,
    });
  }

  async checkWebSocketState(ws: any) {
    // Check the readyState property of the WebSocket object
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        console.log('WebSocket is connecting...');
        if (!this.connectionRetry) {
          this.onConnectionChange('connecting', open);
        }
        // if (this.connectionRetry < 3) {
        //     setTimeout(() => {
        //         if (this.state !== 'connected') {
        //             this.setupWS();
        //         }

        //     }, this.connectionTimeout)
        // } else {
        //     if (this.ws.readyState !== this.ws.OPEN)
        //         // this.ws.close();
        // }
        break;
      case WebSocket.OPEN:
        console.log('WebSocket is open and connected.');
        this.onConnectionChange('connected', open);
        break;
      case WebSocket.CLOSING:
        console.log('WebSocket is closing...');
        this.onConnectionChange('closed', open);
        break;
      case WebSocket.CLOSED:
        console.log('WebSocket is closed.');
        this.onConnectionChange('closed', open);
        break;
      default:
        console.log('Unknown WebSocket state.');
    }
  }

  async handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    const element = track.attach();
    element.setAttribute('width', '160px');
    element.setAttribute('height', '90px');
    element.setAttribute('sid', track.sid as string);

    document
      .getElementsByClassName('hg-screen-container')[0]
      .appendChild(element);
  }

  async handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    let delIdx = 0;
    document
      .getElementsByClassName('hg-screen-container')[0]
      .childNodes.forEach((childNode: any, i: number) => {
        if (childNode.sid === track.sid) {
          delIdx = i;
        }
      });
    document
      .getElementsByClassName('hg-screen-container')[0]
      .removeChild(
        document.getElementsByClassName('hg-screen-container')[0].children[
          delIdx
        ]
      );
  }

  async toggleMic(event: any, self: any) {}

  async toggleWebcam(event: any, self: any) {
    if (!this.isJoined) return;

    this.fitScreenPos();
    const wsUrl = config.SIP_ADDRESS;
    const resToken = await fetch(`${config.BACKEND_URL}/getToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_name: this.roomName,
        participant_name: this.participantName,
      }),
    });
    const token = await resToken.text();
    const room = new Room();

    await room.connect(wsUrl, token);
    // room.remoteParticipants
    await room.localParticipant.enableCameraAndMicrophone();

    room.localParticipant.setCameraEnabled(true);
    // room.localParticipant.setMicrophoneEnabled(true);
    // await room.localParticipant.setScreenShareEnabled(true);

    const videoTrack = await createLocalVideoTrack({
      facingMode: 'user',
      resolution: VideoPresets.h720,
    });
    // const audioTrack = await createLocalAudioTrack({
    // 	echoCancellation: true,
    // 	noiseSuppression: true,
    // });

    const element = videoTrack.attach();
    element.setAttribute('width', '100%');
    element.setAttribute('height', '100%');

    this.mainViewRef!.nativeElement.appendChild(element);

    room.remoteParticipants.forEach((participant) => {
      participant.getTrackPublications().forEach((trackPub) => {
        var element = trackPub.track!.attach();
        element.setAttribute('width', '160px');
        element.setAttribute('height', '90px');
        document
          .getElementsByClassName('hg-screen-container')[0]
          .appendChild(element);
      });
    });

    // const videoPublication = await room.localParticipant.publishTrack(videoTrack);
    // const audioPublication = await room.localParticipant.publishTrack(audioTrack);

    room.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
  }

  async toggleSideTab() {
    if (!this.isJoined) return;

    if (this.sideTabVisible) {
      const mainBody: any = document.getElementsByClassName('hg-body')[0];
      mainBody.style.gridTemplateColumns = 'auto';
    } else {
      const mainBody: any = document.getElementsByClassName('hg-body')[0];
      mainBody.style.gridTemplateColumns = 'auto 360px';
    }
    this.sideTabVisible = !this.sideTabVisible;
    this.fitScreenPos();
  }

  async toggleFullScreen() {
    if (this.fullscreenMode) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    this.fullscreenMode = !this.fullscreenMode;
  }

  async handleLeave() {
    this.router.navigate(['/']);
  }

  async fitScreenPos() {
    const width = this.mainViewRef!.nativeElement.parentElement.offsetWidth;
    const height =
      this.mainViewRef!.nativeElement.parentElement.offsetHeight -
      this.screenContainerRef!.nativeElement.offsetHeight -
      80;
    if (width > Math.round((height * 16) / 9)) {
      this.mainViewRef!.nativeElement.style.setProperty(
        'height',
        height + 'px'
      );
      this.mainViewRef!.nativeElement.style.setProperty('width', 'auto');
    } else {
      this.mainViewRef!.nativeElement.style.setProperty('width', '100%');
      this.mainViewRef!.nativeElement.style.setProperty('height', 'auto');
    }
  }

  async copyLink() {}
}
