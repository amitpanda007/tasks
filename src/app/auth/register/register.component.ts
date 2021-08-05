import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  moduleId: module.id,
  selector: "register",
  templateUrl: "register.component.html",
  styleUrls: ["register.compoennt.scss"],
})
export class RegisterComponent implements OnInit {
  public registerForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.registerForm = fb.group({
      fullName: new FormControl("", [Validators.required, Validators.minLength(4)]),
      email: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$")]),
      password: new FormControl("", [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
    }, { validators: [this.passwordMatch, this.emalValidator] });
  }

   // convenience getter for easy access to form fields
   get f() { return this.registerForm.controls; }

  ngOnInit(): void {
    const emailId = this.route.snapshot.paramMap.get("emailId");
    console.log(emailId);
    if (emailId) {
      this.registerForm.get("email").setValue(emailId);
    }
  }

  passwordMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let pass = control.get('password').value;
    let confirmPass = control.get('confirmPassword').value;
    return pass === confirmPass ? null : { nomatch: true };
  }

  register() {
    this.authService.register(this.registerForm.value);
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
