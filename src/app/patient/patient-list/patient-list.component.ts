import { Component, OnInit } from '@angular/core';
import { PatientService } from '../patient.service';
import { Observable } from 'rxjs';
import { Patient } from '../patient';

@Component({
  selector: 'nghd-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  public patients$: Observable<Patient[]>;
  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.patients$ = this.patientService.getPatients();
  }

  deletePatient(patient: Patient) {
    this.patientService.deletePatient(patient);
  }
}
