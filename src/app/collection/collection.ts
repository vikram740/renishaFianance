import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection',
  imports: [MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class Collection {
  route = inject(Router)

  addCollection(){
    this.route.navigate(['/memberAddCollection']);

  }

}
