import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Patient } from '../patient';
import { PatientService } from '../patient.service';

@Component({
  selector: 'nghd-patient-edit',
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.scss']
})
export class PatientEditComponent implements OnInit, AfterViewInit {
  patientForm: FormGroup; // Define FormGroup
  patient: Patient; // Define data model

  @ViewChild('firstname') firstNameField: ElementRef;
  patientId: number;
  isNewPatient: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.isNewPatient = !this.activatedRoute.snapshot.paramMap.get('id');
    console.log('isNewPatient: ', this.isNewPatient);
    this.buildForm();

    if (!this.isNewPatient) {
      this.patientId = +this.activatedRoute.snapshot.paramMap.get('id');
      this.getPatient();
    }
  }

  private buildForm() {
    // Define FormControls in the FormGroup along with their validators
    this.patientForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      addresses: [[]]
    });
  }

  private getPatient() {
    this.patientService.getPatient(this.patientId).subscribe(pt => this.patientForm.patchValue(pt));
  }

  private save(model: Patient) {
    console.log('Form model: ', this.patientForm);
    if (this.isNewPatient) {
      console.log('Add patient: ', model);
      this.patientService.addPatient(model);
    } else {
      const patient = { ...model, id: this.patientId };
      console.log('Save patient: ', patient);
      this.patientService.updatePatient(patient);
    }
    this.router.navigateByUrl('/patient/list');
  }

  ngAfterViewInit() {
    if (this.isNewPatient) {
      this.firstNameField.nativeElement.focus();
    }
  }

  get f(): any {
    return this.patientForm.controls;
  }
}
