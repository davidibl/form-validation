import { Injectable } from '@angular/core';
import { RemoteValidationErrors } from '../model/remoteValidatonErrors';

@Injectable()
export class RemoteValidationService {

    public validate(value: any): RemoteValidationErrors {
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
