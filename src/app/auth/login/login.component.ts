import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";

@Component({
  moduleId: module.id,
  selector: "login",
  templateUrl: "login.component.html",
  styleUrls: ["login.compoennt.scss"],
})
export class LoginComponent implements OnInit {
  public loginForm;

  constructor(fb: FormBuilder, private authService: AuthService) {
    this.loginForm = fb.group({
      email: "",
      password: "",
    });
  }

  ngOnInit(): void {}

  login() {
    console.log(this.loginForm.value);
    this.authService.login(this.loginForm.value);
  }
}
