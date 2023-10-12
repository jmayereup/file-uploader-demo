import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from "./file-uploader/file-uploader.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, FileUploaderComponent]
})
export class AppComponent {
  title = 'file-uploader-demo';
}