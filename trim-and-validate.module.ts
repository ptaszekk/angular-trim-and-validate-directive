import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TrimAndValidateDirective } from "./trim-and-validate.directive";

@NgModule({
  imports: [ CommonModule ],
  exports: [ TrimAndValidateDirective ],
  declarations: [ TrimAndValidateDirective ],
  providers: [],
})
export class TrimAndValidateModule {
}
