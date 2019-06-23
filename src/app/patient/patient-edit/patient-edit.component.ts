import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
  FormControl,
  ValidatorFn
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Patient } from '../patient';
import { PatientService } from '../patient.service';
import { AddressType, State } from 'src/app/address/address';
import { TypeofExpr } from '@angular/compiler';

function sameAddressType(): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    // console.log('c', c);
    if (c.value && c.value.length >= 2) {
      const addressType1 = c.get('0.addressType').value;
      const addressType2 = c.get('1.addressType').value;
      return addressType1 === addressType2 ? { sameAddressType: true } : null;
    }
    return null;
  };
}

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
  pageTitle: string;
  submitButtonText: string;
  addressType = AddressType;
  State: typeof State = State;
  stateOptions: string[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    // console.log('ngOnInit');
    this.isNewPatient = !this.activatedRoute.snapshot.paramMap.get('id');
    this.pageTitle = this.isNewPatient ? 'Add new patient' : 'Edit patient';
    this.submitButtonText = this.isNewPatient ? 'Register' : 'Update';
    this.stateOptions = Object.keys(State);

    this.buildForm();

    if (!this.isNewPatient) {
      this.patientId = +this.activatedRoute.snapshot.paramMap.get('id');
      this.getPatient();
    }
  }

  private buildForm() {
    // console.log('buildForm');
    this.patientForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      ailments: this.fb.array(this.isNewPatient ? [this.initAilment()] : []),
      addresses: this.fb.array(this.isNewPatient ? [this.initAddress()] : [], sameAddressType())
    });
    // console.log('buildForm: this.patientForm', this.patientForm);
  }

  // Ailments
  get ailmentsArray(): FormArray {
    return this.patientForm.get('ailments') as FormArray;
  }

  getAddAddressText(): string {
    return this.addressesArray.length < 2 ? 'Add address' : 'Only 2 addresses allowed';
  }

  initAilment(): FormControl {
    // console.log('initAilment()');
    return new FormControl('', [Validators.required]);
  }

  addAilment(): void {
    this.ailmentsArray.push(this.initAilment());
    // console.log('ailmentsArray: ', this.ailmentsArray);
  }

  removeAilment(i: number) {
    this.ailmentsArray.removeAt(i);
    this.ailmentsArray.markAsDirty();
  }

  // Addresses
  get addressesArray(): FormArray {
    // console.log('get addressesArray this.patientForm', this.patientForm);
    return this.patientForm.get('addresses') as FormArray;
  }

  initAddress(): FormGroup {
    // console.log('initAddress()');
    const group = this.fb.group({
      addressType: [this.getDefaultNewAddressType()],
      isPrimary: [false],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postcode: ['', [Validators.required, Validators.maxLength(4)]],
      country: ['', Validators.required]
    });
    // console.log('end initAddress()', group);
    return group;
  }

  getDefaultNewAddressType(): AddressType {
    // console.log('getDefaultNewAddressType()');
    if (this.patientForm) {
      const currentAddressType = this.addressesArray.get('0.addressType').value;
      return currentAddressType === AddressType.Postal
        ? AddressType.Residential
        : AddressType.Postal;
    }

    return AddressType.Residential;
  }

  addAddress(): void {
    this.addressesArray.push(this.initAddress());
    // console.log('addressesArray', this.addressesArray);
  }

  removeAddress(i: number): void {
    // console.log('Removing address at ', i);
    this.addressesArray.removeAt(i);
    this.addressesArray.markAsDirty();
  }

  // Patient
  getPatient() {
    this.patientService.getPatient(this.patientId).subscribe((pt: Patient) => {
      this.displayPatient(pt);
    });
    // console.log('patientForm: ', this.patientForm);
    // console.log('ailmentsArray: ', this.ailmentsArray);
    // console.log('addressesArray', this.addressesArray);
  }

  displayPatient(patient: Patient) {
    if (this.patientForm) {
      this.patientForm.reset();
    }
    this.patient = patient;
    this.patientForm.patchValue({
      firstname: this.patient.firstname,
      lastname: this.patient.lastname,
      email: this.patient.email
    });

    // I found this method of adding controls to the array, each with a Validator,
    // does not appear to work eventhough according to the documentation it should. (if I've read the docs correctly that is :-o)
    // It adds a control for each ailment in the patient.ailment array,
    // but does not include the Validator in each of the controls

    // this.patientForm.setControl(
    //   'ailments',
    //   this.fb.array([this.patient.ailments || [], Validators.required])
    // );

    for (const ailment of patient.ailments) {
      const ctrl = new FormControl(ailment, Validators.required);
      this.ailmentsArray.push(ctrl);
    }

    for (const address of patient.addresses) {
      const group = this.fb.group({
        addressType: [address.addressType || AddressType.Residential],
        isPrimary: address.isPrimary || false,
        street: [address.street, Validators.required],
        city: [address.city, Validators.required],
        postcode: [address.postcode, [Validators.required, Validators.maxLength(4)]],
        state: [address.state, Validators.required],
        country: [address.country, Validators.required]
      });
      this.addressesArray.push(group);
    }

    this.addressesArray.setValidators(sameAddressType());
    this.addressesArray.updateValueAndValidity();
  }

  private save(model: Patient) {
    // console.log('Form model: ', this.patientForm);
    if (this.isNewPatient) {
      // console.log('Add patient: ', model);
      this.patientService.addPatient(model);
    } else {
      const patient = { ...model, id: this.patientId };
      // console.log('Save patient: ', patient);
      this.patientService.updatePatient(patient);
    }
    this.router.navigateByUrl('/patient/list');
  }

  ngAfterViewInit() {
    if (this.isNewPatient) {
      this.firstNameField.nativeElement.focus();
    }
  }
}
