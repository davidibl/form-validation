import { Directive, forwardRef, OnDestroy } from '@angular/core';
import { Validator, NG_VALIDATORS, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators/delay';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { RemoteValidationService } from '../services/remoteValidationService';
import { RemoteValidationErrors, RemoteValidationError } from '../model/remoteValidatonErrors';

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

    constructor(private _remoteValidationService: RemoteValidationService) { }

    public validate(control: FormGroup) {
        control.markAsPending();
        this.subscription = this._remoteValidationService
            .validate(control.value)
            .pipe(
                tap(_ => this.resetValidationErrors(control)),
                map(errors => {
                    const errorsObject = errors as RemoteValidationErrors;
                    errorsObject.errors.forEach(error => {
                        this.setError(control, error);
                    });
                })
            )
            .subscribe();
        return null;
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private setError(form: FormGroup, error: RemoteValidationError) {
        const control = Object.keys(error)[0].split('.')
            .reduce((previousValue, path) => previousValue.controls[path], form);
        const newError = this.createValidationMessage(error);
        const newErrors = (control.errors) ? Object.assign(control.errors, newError) : newError;
        control.setErrors(newErrors);
    }

    private resetValidationErrors(form: FormGroup) {
        const controls = Object.keys(form.controls)
            .map(key => form.controls[key]);

        controls
            .filter(control => !control['controls'])
            .forEach(control => control.setErrors(null));

        controls
            .filter(control => !!control['controls'])
            .forEach(control => this.resetValidationErrors(<FormGroup>control));
    }

    private createValidationMessage(error: {[key: string]: string}) {
        return {
            serverMessage: {
                message: error[Object.keys(error)[0]],
            }
        };
    }
}
