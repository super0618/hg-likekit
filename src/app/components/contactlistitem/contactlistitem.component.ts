import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-contactlistitem",
	standalone: true,
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./contactlistitem.component.html",
	styleUrl: "./contactlistitem.component.scss",
})
export class ContactListItemComponent {
	@Input() title = "Thomas Pichler";
	@Input() description = "Project Manager";

	onCall() {
		console.log('button is clicked')
	}
}
