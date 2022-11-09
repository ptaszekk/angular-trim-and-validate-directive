import {
	Directive,
	ElementRef,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
} from "@angular/core";
import {
	BehaviorSubject,
	pairwise,
	startWith,
	Subscription,
	take,
	withLatestFrom,
} from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { AsyncValidatorFn, FormGroup } from "@angular/forms";
import { InputSelectionParameters } from "./trim-and-validate.model";
import {
	handleCaretPosition,
	setInputValue,
	setSelectionParameters,
} from "./trim-and-validate.helpers";

@Directive({
	selector: "[trimAndValidate]",
})
export class TrimAndValidateDirective implements OnInit, OnDestroy, AfterViewInit {
	@Input() asyncValidatorFns!: AsyncValidatorFn[];
	@Input() controlsKeyForValidation!: string;
	@Input() inputForm!: FormGroup;
	initialName!: string;
	settingValueForFirstTime = true;
	#currentKey$ = new BehaviorSubject<string>("");
	#inputSelectionParameters$ = new BehaviorSubject<InputSelectionParameters>({
		selectionStart: 0,
		selectionEnd: 0,
	});
	#subscription = new Subscription();
	#timeout = setTimeout(() => {});

	constructor(private elementRef: ElementRef) {}

	@HostListener("input", ["$event"]) onInput(event: Event): void {
		setSelectionParameters(this.#inputSelectionParameters$, event);
	}

	@HostListener("keydown", ["$event"]) onKeyDown(event: KeyboardEvent): void {
		this.#currentKey$.next(event.key);
	}

	ngOnInit(): void {
		    addAsyncValidators(this.inputForm, this.controlsKeyForValidation, this.asyncValidatorFns);


		this.#subscription.add(
			this.inputForm.controls[this.controlsKeyForValidation].valueChanges
				.pipe(
					startWith(
						this.inputForm.controls[this.controlsKeyForValidation].value
					),
					tap(() => {
						clearTimeout(this.#timeout);
						this.inputForm.controls[
							this.controlsKeyForValidation
						].clearAsyncValidators();
					}),
				        distinctUntilChanged(),
					pairwise(),
					withLatestFrom(this.#inputSelectionParameters$, this.#currentKey$),
					map(([name, selectionParameters, currentKey]) => ({
						previous: {
							name: name[0],
							selectionStart: selectionParameters.selectionStart,
							selectionEnd: selectionParameters.selectionEnd,
						},
						current: {
							name: name[1],
							keyIsSpace: currentKey === " ",
							keyIsBackspace: currentKey === "Backspace",
						},
					}))
				)
				.subscribe(({ previous, current }) => {
					 setInputValue(this.initialName, current.name, this.settingValueForFirstTime, this.inputForm, this.controlsKeyForValidation);
          addAsyncValidators(this.inputForm, this.controlsKeyForValidation, this.asyncValidatorFns);
				          this.settingValueForFirstTime = false;

					if (current.keyIsSpace || current.keyIsBackspace) {
						handleCaretPosition(this.elementRef, previous, current);
					} else {
						this.#timeout = setTimeout(() => {
							handleCaretPosition(this.elementRef, previous, current);
						}, 400);
					}
				})
		);
	}
	
	ngAfterViewInit(): void {
    this.inputForm.controls[this.controlsKeyForValidation].valueChanges.pipe(take(1)).subscribe((value) => {
      this.initialName = value;
    });
  }

	ngOnDestroy(): void {
		this.#subscription.unsubscribe();
	}
}
