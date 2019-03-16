import { Directive, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { Validator, NG_VALIDATORS, FormGroup, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { RemoteValidationService } from '../services/remoteValidationService';
import { RemoteValidationErrors, RemoteValidationError } from '../model/remoteValidatonErrors';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';

@Directive({
    providers: [
        {
            multi: true,
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => FormValidator),
        },
    ],
    selector: '[xnFormValidator]',
})
export class FormValidator implements Validator, OnDestroy {

    private subscription: Subscription;
    private _debounceSubject = new ReplaySubject<() => void>(1);

    constructor(private _remoteValidationService: RemoteValidationService) {
        this._debounceSubject.pipe( debounceTime(500) ).subscribe(func => func());
    }

    public validate(form: FormGroup) {
        this._debounceSubject.next(() => this.validateRemote(form));
        return null;
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private validateRemote(form: FormGroup) {
        this.markAllPending(form);
        this.subscription = this._remoteValidationService
            .validate(form.value)
            .pipe(
                tap(_ => this.resetValidationErrors(form)),
                map(errors => {
                    const errorsObject = errors as RemoteValidationErrors;
                    errorsObject.errors.forEach(error => {
                        this.setError(form, error);
                    });
                })
            )
            .subscribe();
    }

    private setError(form: FormGroup, error: RemoteValidationError) {
        const control = Object.keys(error)[0].split('.')
            .reduce((previousValue, path) => previousValue.controls[path], form);
        const newError = this.createValidationMessage(error);
        const newErrors = (control.errors) ? Object.assign(control.errors, newError) : newError;
        control.setErrors(newErrors);
    }

    private markAllPending(form: FormGroup) {
        this.forAllControls(form, (group) => this.markAllPending(group), (control) => control.markAsPending());
    }

    private resetValidationErrors(form: FormGroup) {
        this.forAllControls(form, (group) => this.resetValidationErrors(group), (control) => control.setErrors(null));
    }

    private forAllControls(form: FormGroup, formGroupFunc: (formGroup: FormGroup) => void, func: (control: AbstractControl) => void) {
        const controls = Object.keys(form.controls)
            .map(key => form.controls[key]);

        controls
            .filter(control => !control['controls'])
            .forEach(control => func(control));

        controls
            .filter(control => !!control['controls'])
            .forEach(control => formGroupFunc(<FormGroup>control));
    }

    private createValidationMessage(error: {[key: string]: string}) {
        return {
            serverMessage: {
                message: error[Object.keys(error)[0]],
            }
        };
    }
}
