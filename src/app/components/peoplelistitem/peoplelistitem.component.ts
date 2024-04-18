import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-peoplelistitem",
	standalone: true,
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./peoplelistitem.component.html",
	styleUrl: "./peoplelistitem.component.scss",
})
export class PeopleListItemComponent {
	@Input() name = "Thomas Pichler";
	@Input() role = "Project Manager";
}
