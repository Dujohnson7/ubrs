package com.ubrs.ubrs_backend.controller.userManagement;

import com.ubrs.ubrs_backend.domain.dto.users.LoginResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersRequestDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final IUsersService  usersService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UsersRequestDto loginRequest) {
        try {
            LoginResponseDto respond =  usersService.loginUser(loginRequest);
            return ResponseEntity.ok(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            usersService.logoutUser();
            return ResponseEntity.ok("User Logout successfully");
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email){
        try {
            UsersResponseDto respond =  usersService.forgotPassword(email);
            return ResponseEntity.ok(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/verify-forgotPassword")
    public ResponseEntity<?> verifyForgotPassword(@RequestParam String email, @RequestParam String otp) {
        try {
            UsersResponseDto respond =  usersService.verifyForgotPassword(email, otp );
            return ResponseEntity.ok(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String otp, @RequestParam String newPassword) {
        try {
            UsersResponseDto respond =  usersService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam String email, @RequestParam String oldPassword, @RequestParam String newPassword) {
        try {
            UsersResponseDto respond = usersService.changePassword(email, oldPassword, newPassword);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
