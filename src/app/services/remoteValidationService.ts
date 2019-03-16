import { Injectable } from '@angular/core';
import { RemoteValidationErrors } from '../model/remoteValidatonErrors';
import { delay } from 'rxjs/operators/delay';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class RemoteValidationService {

    public validate(value: any): Observable<RemoteValidationErrors> {
        // Simulation of a remote validation service
        return Observable.create(observer => {
            observer.next(this.getErrors(value));
        })
        .pipe( delay(2000) );
    }

    private getErrors(value: any) {
        const errors = [];
        if (!value.feldA) {
            errors.push({'feldA': 'uups'});
        }
        if (!value.feldB) {
            errors.push({'feldB': 'huch'});
        }
        if (!value.sub || !value.sub.feldB) {
            errors.push({'sub.feldB': 'blubb'});
        }
        return {
            errors: errors
        };
    }
}
