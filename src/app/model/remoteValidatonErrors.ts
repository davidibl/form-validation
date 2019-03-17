export class RemoteValidationError {
    [fieldPath: string]: string;
}

export class RemoteValidationErrors {
    errors: RemoteValidationError[];
    generalMessage: string;
}
