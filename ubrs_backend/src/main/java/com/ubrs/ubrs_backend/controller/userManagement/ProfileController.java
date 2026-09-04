package com.ubrs.ubrs_backend.controller.userManagement;

import com.ubrs.ubrs_backend.domain.dto.users.UsersRequestDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import lombok.RequiredArgsConstructor;
import org.hibernate.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final IUsersService usersService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUsersById(@PathVariable String userId) {
        try {
            UsersResponseDto respond =  usersService.getUserById(UUID.fromString(userId));
            return ResponseEntity.ok(respond);
        }catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }



    @PutMapping(value = "/update/{userId}", consumes = "multipart/form-data")
    public ResponseEntity<?> changeProfile( @PathVariable String userId,  @ModelAttribute UsersRequestDto userDto) {

        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            if (userDto.getProfileFile() != null && !userDto.getProfileFile().isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + userDto.getProfileFile().getOriginalFilename();
                userDto.getProfileFile().transferTo(new File(uploadDir + fileName));
                userDto.setProfile(fileName);
            }

            UsersResponseDto respond = usersService.updateUser(UUID.fromString(userId), userDto);
            return ResponseEntity.ok(respond);

        }catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping(value = "/signature/{userId}", consumes = "multipart/form-data")
    public ResponseEntity<?> userSignature(@PathVariable String userId, @RequestParam(value = "userSignature", required = false) MultipartFile userSignature) {
        try {
            usersService.getUserById(UUID.fromString(userId));
            String uploadDir = System.getProperty("user.dir") + "/uploads/signature/";
            File dir = new File(uploadDir);

            if (!dir.exists()) {
                dir.mkdirs();
            }

            if (userSignature == null || userSignature.isEmpty()) {
                return ResponseEntity.badRequest().body("Signature file is required");
            }

            String fileName = UUID.randomUUID() + "_" + userSignature.getOriginalFilename();

            userSignature.transferTo(new File(uploadDir + fileName));

            UsersRequestDto requestDto = new UsersRequestDto();
            requestDto.setSignature(fileName);
            UsersResponseDto updatedUser = usersService.updateUser(UUID.fromString(userId), requestDto);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }



    @PutMapping("/changePassword/{userId}")
    public ResponseEntity<?> changePassword(@PathVariable String userId,  @RequestBody UsersRequestDto request) {
        try {
            usersService.changePassword(UUID.fromString(userId), request.getPassword());
            return ResponseEntity.ok("Password Change Successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PostMapping("/checkPassword")
    public ResponseEntity<?> checkPassword( @RequestParam String userId,  @RequestParam String password) {
        try {
            UsersResponseDto foundUser = usersService.getUserWithPassword(UUID.fromString(userId), password);
            if (foundUser != null) {
                return ResponseEntity.ok("Password is correct");
            } else {
                return ResponseEntity.badRequest().body("Password does not match");
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
