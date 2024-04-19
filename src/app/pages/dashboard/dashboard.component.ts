import { Component, HostListener, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { PeopleListItemComponent } from "../../components/peoplelistitem/peoplelistitem.component";
import { PeopleScreenComponent } from "../../components/peoplescreen/peoplescreen.component";
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent, VideoPresets, createLocalAudioTrack, createLocalVideoTrack } from "livekit-client";

@Component({
	selector: "app-dashboard",
	standalone: true,
	imports: [MatIconModule, MatButtonModule, MatBadgeModule, PeopleListItemComponent, PeopleScreenComponent, NgIf],
	templateUrl: "./dashboard.component.html",
	styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements AfterViewInit {
	fullscreenMode = false;
	sideTabVisible = false;
	meeting_title = "Business Weekly Meeting";
	meeting_time = "April 16th, 2023 | 10:00 AM";

	@ViewChild("mainView") mainViewRef: ElementRef | null = null;
	@ViewChild("screenContainer") screenContainerRef: ElementRef | null = null;

	async ngAfterViewInit(): Promise<void> {
		this.fitScreenPos();
		const wsUrl = "wss://hotelgenie-ae73y1rz.livekit.cloud";
		const resToken = await fetch("http://localhost:3000/getToken");
		const token = await resToken.text();
		const room = new Room();

		await room.connect(wsUrl, token);
		// room.remoteParticipants
		await room.localParticipant.enableCameraAndMicrophone();

		room.localParticipant.setCameraEnabled(true);
		// room.localParticipant.setMicrophoneEnabled(true);
		// await room.localParticipant.setScreenShareEnabled(true);

		const videoTrack = await createLocalVideoTrack({
			facingMode: "user",
			resolution: VideoPresets.h720,
		});
		// const audioTrack = await createLocalAudioTrack({
		// 	echoCancellation: true,
		// 	noiseSuppression: true,
		// });

		const element = videoTrack.attach();
		element.setAttribute("width", "100%");
		element.setAttribute("height", "100%");

		this.mainViewRef!.nativeElement.appendChild(element);

		room.remoteParticipants.forEach((participant) => {
			participant.getTrackPublications().forEach((trackPub) => {
				var element = trackPub.track!.attach();
				element.setAttribute("width", "160px");
				element.setAttribute("height", "90px");
				document.getElementsByClassName("hg-screen-container")[0].appendChild(element);
			});
		});

		// const videoPublication = await room.localParticipant.publishTrack(videoTrack);
		// const audioPublication = await room.localParticipant.publishTrack(audioTrack);

		room.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
		room.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
	}

	@HostListener("window:resize", ["$event"])
	onResize(event: any) {
		this.fitScreenPos();
	}

	handleTrackSubscribed(track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) {
		const element = track.attach();
		element.setAttribute("width", "160px");
		element.setAttribute("height", "90px");
		element.setAttribute("sid", track.sid as string);

		document.getElementsByClassName("hg-screen-container")[0].appendChild(element);
	}

	handleTrackUnsubscribed(track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) {
		let delIdx = 0;
		document.getElementsByClassName("hg-screen-container")[0].childNodes.forEach((childNode: any, i: number) => {
			if (childNode.sid === track.sid) {
				delIdx = i;
			}
		});
		document.getElementsByClassName("hg-screen-container")[0].removeChild(document.getElementsByClassName("hg-screen-container")[0].children[delIdx]);
	}

	toggleMic(event: any, self: any) {}

	toggleWebcam(event: any, self: any) {}

	toggleSideTab() {
		if (this.sideTabVisible) {
			const mainBody: any = document.getElementsByClassName("hg-body")[0];
			mainBody.style.gridTemplateColumns = "auto";
		} else {
			const mainBody: any = document.getElementsByClassName("hg-body")[0];
			mainBody.style.gridTemplateColumns = "auto 360px";
		}
		this.sideTabVisible = !this.sideTabVisible;
	}

	toggleFullScreen() {
		if (this.fullscreenMode) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
		this.fullscreenMode = !this.fullscreenMode;
	}

	fitScreenPos() {
		const width = this.mainViewRef!.nativeElement.parentElement.offsetWidth;
		const height = this.mainViewRef!.nativeElement.parentElement.offsetHeight - this.screenContainerRef!.nativeElement.offsetHeight - 80;
		if (width > Math.round((height * 16) / 9)) {
			this.mainViewRef!.nativeElement.style.setProperty("height", height + "px");
			this.mainViewRef!.nativeElement.style.setProperty("width", "auto");
		} else {
			this.mainViewRef!.nativeElement.style.setProperty("width", "100%");
			this.mainViewRef!.nativeElement.style.setProperty("height", "auto");
		}
	}
}
