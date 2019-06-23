import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Patient } from '../patient';

@Component({
  selector: 'nghd-patient-table',
  templateUrl: './patient-table.component.html',
  styleUrls: ['./patient-table.component.scss']
})
export class PatientTableComponent implements OnInit {
  @Input() patients: Patient[];
  @Output() patientDeleted: EventEmitter<Patient> = new EventEmitter<Patient>();

  constructor() {}

  ngOnInit() {}

  deletePatient(patient: Patient) {
    this.patientDeleted.emit(patient);
  }

  getDescription(ailments: string[]): string {
    return ailments.join(', ');
  }
}
