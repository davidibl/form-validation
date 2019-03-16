import { Directive, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
    selector: '[xnFormModel]',
})
export class FormModelDirective implements OnInit {

    @Input()
    public form: FormGroupDirective;

    @Input()
    public set xnFormModel(model: any) {
        if (!model) { return; }
        if (JSON.stringify(model) === JSON.stringify(this.form.form.value)) { return; }
        this.form.form.setValue(model);
    }

    @Output()
    public xnFormModelChange = new EventEmitter<any>();
    constructor() { }

    public ngOnInit() {
        this.form.valueChanges.subscribe(_ => {
            this.xnFormModelChange.emit(this.form.value);
        });
    }

}
