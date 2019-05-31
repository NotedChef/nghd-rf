import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Patient } from './patient';
import { tap, catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientUrl = environment.API_BASE + '/patients'; // URL to web api
  private patients$: BehaviorSubject<Patient[]> = new BehaviorSubject<Patient[]>([]);

  constructor(private httpClient: HttpClient) {
    this.loadPatients();
  }

  public loadPatients() {
    this.httpClient
      .get<Patient[]>(`${this.patientUrl}?_sort=id&_order=desc`)
      .pipe(
        tap(data => console.log('loaded patients', data)),
        catchError(this.handleError<Patient[]>('loadedPatients', []))
      )
      .subscribe(patients => this.patients$.next(patients));
  }

  public getPatients(): Observable<Patient[]> | null {
    return this.patients$;
  }

  public getPatient(id: number): Observable<Patient> {
    const url = `${this.patientUrl}/${id}`;
    return this.httpClient.get<Patient>(url).pipe(
      tap(data => console.log(`fetch patients with id: ${id}`, data)),
      catchError(this.handleError<Patient>(`getPatient id=${id}`, null))
    );
  }

  public searchPatients(term: string): Observable<Patient[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.httpClient.get<Patient[]>(`${this.patientUrl}/?name=${term}`).pipe(
      tap(() => console.log(`found patients matching "${term}"`)),
      catchError(this.handleError(`searchPatients`, []))
    );
  }

  public addPatient(patient: Patient) {
    // console.log('service add patient:', patient);
    this.httpClient
      .post<Patient>(this.patientUrl, patient, httpOptions)
      .pipe(
        tap(() => console.log(`added patient: ${patient.firstname + ' ' + patient.lastname}`)),
        catchError(this.handleError(`addPatient`, null))
      )
      .subscribe(pt => this.loadPatients());
  }

  public deletePatient(patient: Patient | number) {
    const id = typeof patient === 'number' ? patient : patient.id;
    this.httpClient
      .delete<Patient>(this.patientUrl, httpOptions)
      .pipe(
        tap(() => console.log(`deleted patient with id = ${id}`)),
        catchError(this.handleError('deletePatient'))
      )
      .subscribe(pt => this.loadPatients());
  }

  public updatePatient(patient: Patient) {
    console.log('service update patient at:', patient, this.patientUrl);
    this.httpClient
      .put(`${this.patientUrl}/${patient.id}`, patient, httpOptions)
      .pipe(
        tap(data => console.log(`updated patient with id = ${patient.id}`, data)),
        catchError(this.handleError(`upadtePatient`, null))
      )
      .subscribe(pt => this.loadPatients());
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of({} as T);
    };
  }
}
