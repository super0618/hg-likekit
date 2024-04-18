import { Component, HostListener, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { PeopleListItemComponent } from "../../components/peoplelistitem/peoplelistitem.component";
import { PeopleScreenComponent } from "../../components/peoplescreen/peoplescreen.component";

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

	toggleMic(event: any, self: any) {
		console.log(this);
	}

	toggleWebcam(event: any, self: any) {
		console.log(this);
	}

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
		const width = this.mainViewRef?.nativeElement.parentElement.offsetWidth;
		const height = this.mainViewRef?.nativeElement.parentElement.offsetHeight - this.screenContainerRef?.nativeElement.offsetHeight - 80;
		if (width > Math.round((height * 16) / 9)) {
			this.mainViewRef?.nativeElement.style.setProperty("height", height + "px");
			this.mainViewRef?.nativeElement.style.setProperty("width", "auto");
		} else {
			this.mainViewRef?.nativeElement.style.setProperty("width", "100%");
			this.mainViewRef?.nativeElement.style.setProperty("height", "auto");
		}
	}

	@ViewChild("mainView") mainViewRef: ElementRef | null = null;
	@ViewChild("screenContainer") screenContainerRef: ElementRef | null = null;

	ngAfterViewInit(): void {
		this.fitScreenPos();
	}

	@HostListener("window:resize", ["$event"])
	onResize(event: any) {
		this.fitScreenPos();
	}
}
