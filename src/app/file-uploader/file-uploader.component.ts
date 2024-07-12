import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})


export class FileUploaderComponent {
  http = inject(HttpClient);

  errorMessage : any = null;
  successMessage = "";
  selectedFile: File | undefined = undefined;

  form = new FormGroup({
    file: new FormControl()
  });

  constructor() { }

  onFileSelected(event: any) {
    this.successMessage = "";
    this.errorMessage = null;
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      };
    }
  
  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.selectedFile!);

    this.http.post('http://localhost:3001/upload', formData)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.selectedFile = undefined;
          this.form.reset();
          this.successMessage = "File Upload Successful";
        },
        error: (error: Promise<Error>) => {
          console.error('Error Uploading File', error);
          this.errorMessage = error;
        }
  });
  }

  clearMessages() {
    this.errorMessage = null;
    this.successMessage = "";
  }

}
