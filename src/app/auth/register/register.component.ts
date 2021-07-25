import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
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
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  ngOnInit(): void {
    const emailId = this.route.snapshot.paramMap.get("emailId");
    console.log(emailId);
    if (emailId) {
      this.registerForm.get("email").setValue(emailId);
    }
  }

  register() {
    console.log(this.registerForm.value);
    this.authService.register(this.registerForm.value);
  }
}
