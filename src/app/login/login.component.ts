
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginSubmitted = false;
  registerSubmitted = false;
  isLogin = true;
  loginError: string | null = null; // To display login error messages

  constructor(private fb: FormBuilder, private router: Router) {
    // Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Register Form with password confirmation
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Getter for login form controls
  get lf() {
    return this.loginForm.controls;
  }

  // Getter for register form controls
  get rf() {
    return this.registerForm.controls;
  }

  // Custom validator for password match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  toggleForm(isLogin: boolean) {
    this.isLogin = isLogin;
    this.loginSubmitted = false;
    this.registerSubmitted = false;
    this.loginError = null; // Reset error message on toggle
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onLoginSubmit() {
    this.loginSubmitted = true;
    this.loginError = null; // Reset error message on new submission

    if (this.loginForm.valid) {
      const enteredEmail = this.loginForm.value.email;
      const enteredPassword = this.loginForm.value.password;

      // Retrieve registered user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);

        // Check if credentials match
        if (user.email === enteredEmail && user.password === enteredPassword) {
          console.log('Login successful:', this.loginForm.value);
          this.router.navigate(['/main']); // Redirect on success
        } else {
          this.loginError = 'Invalid email or password.';
        }
      } else {
        this.loginError = 'No registered user found. Please register first.';
      }
    }
  }

  onRegisterSubmit() {
    this.registerSubmitted = true;
    this.loginError = null; // Reset login error on registration

    if (this.registerForm.valid) {
      const user = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      localStorage.setItem('user', JSON.stringify(user)); // Store user data
      console.log('Registration successful:', user);
      this.toggleForm(true); // Switch to login after registration
    }
  }
}