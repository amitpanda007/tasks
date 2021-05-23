import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  moduleId: module.id,
  selector: "register",
  templateUrl: "register.component.html",
  styleUrls: ["register.compoennt.scss"],
})
export class RegisterComponent implements OnInit {
  public registerForm;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = fb.group({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  ngOnInit(): void {}

  register() {
    console.log(this.registerForm.value);
    this.authService.register(this.registerForm.value);
  }
}
