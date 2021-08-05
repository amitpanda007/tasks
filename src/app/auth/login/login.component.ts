import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";

@Component({
  moduleId: module.id,
  selector: "login",
  templateUrl: "login.component.html",
  styleUrls: ["login.compoennt.scss"],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isResettingPassword: boolean = false;
  public resetEmail: string;
  public resetEmailValid: boolean = false;

  constructor(fb: FormBuilder, private authService: AuthService) {
    this.loginForm = fb.group({
      email: new FormControl("", [
        Validators.required
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
      ]),
    }, { validators: this.emalValidator });
  }

  ngOnInit(): void {}

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  login() {
    console.log(this.loginForm.value);
    this.authService.login(this.loginForm.value);
  }

  toggleResetView() {
    this.isResettingPassword = true;
  }

  passwordReset() {
    console.log(`Resetting password with ${this.resetEmail}`);
    if(this.resetEmail.trim()) {
      this.authService.resetUserPassword(this.resetEmail);
      this.resetEmail="";
    }
  }

  resetEmailChange() {
    this.resetEmailValid = this.validateEmail(this.resetEmail);
  }

  validateEmail(email: string) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  emalValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let email = control.get('email').value;
    return this.validateEmail(email) ? null : { emailError: true };
  }
}
