import { ElementRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AsyncValidatorFn, FormGroup } from "@angular/forms";
import { InputSelectionParameters } from "./trim-and-validate.model";

export const setSelectionParameters = (
	selectionParameters: BehaviorSubject<InputSelectionParameters>,
	event: Event
): void => {
	selectionParameters.next({
		selectionStart: (<HTMLTextAreaElement>event.target).selectionStart,
		selectionEnd: (<HTMLTextAreaElement>event.target).selectionEnd,
	});
};

export const hasNoSpaces = (name: string): boolean => {
	return [...name.matchAll(/ /g)].map((match) => match.index).length === 0;
};

export const hasSpaceBeforeSelectionStart = (
	previousName: string,
	previousSelectionStart: number
): boolean => {
	return previousName.indexOf(" ", previousSelectionStart - 1) !== -1;
};

export const setCaretPosition = (
	elementRef: ElementRef,
	selectionStart: number
): void => {
	elementRef.nativeElement.setSelectionRange(selectionStart, selectionStart);
};

export const trimStringStartAndRemoveMultipleSpaces = (name: string): string => {
	return name.replace(/\s\s+/g, " ").trimStart();
};

export const handleCaretPosition = (
	elementRef: ElementRef,
	previous: { name: string; selectionStart: number; selectionEnd: number },
	current: { name: string; keyIsSpace: boolean }
): void => {
	if (hasNoSpaces(previous.name)) {
		if (
			previous.name.length < current.name.length &&
			previous.selectionStart !== previous.selectionEnd
		) {
			setCaretPosition(elementRef, previous.selectionStart);
		}

		if (
			previous.name !== "" &&
			(previous.name.length + 1 < current.name.length ||
				previous.name.length > current.name.length)
		) {
			setCaretPosition(elementRef, previous.selectionStart);
		}
	} else {
		if (
			hasSpaceBeforeSelectionStart(previous.name, previous.selectionStart) &&
			current.keyIsSpace
		) {
			setCaretPosition(elementRef, previous.selectionStart - 1);
		}

		if (
			current.name.endsWith(" ") &&
			previous.selectionStart === current.name.length
		) {
			setCaretPosition(elementRef, previous.selectionStart);
		}
	}
};

export const setInputValue = (initialName: string, currentName: string, settingValueForFirstTime: boolean, form: FormGroup, controlsKey: string): void => {
  form.controls[controlsKey].patchValue(trimStringStartAndRemoveMultipleSpaces(currentName), { emitEvent: false });
  if (initialName !== '' && initialName === currentName && settingValueForFirstTime) {
    form.controls[controlsKey].markAsPristine();
  } else {
    form.controls[controlsKey].markAsDirty();
  }
};

export const addAsyncValidators = (form: FormGroup, controlsKey: string, validators: AsyncValidatorFn[]): void => {
  form.controls[controlsKey].addAsyncValidators(validators);
  form.controls[controlsKey].updateValueAndValidity({ onlySelf: true });
};
