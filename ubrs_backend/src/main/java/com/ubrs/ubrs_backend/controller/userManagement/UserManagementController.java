package com.ubrs.ubrs_backend.controller.userManagement;

import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersRequestDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userManagement")
public class UserManagementController {

    private final IUsersService usersService;


    @GetMapping( "/all")
    public ResponseEntity<List<UsersResponseDto>> getAllUsers() {
        try {
            List<UsersResponseDto> usersList = usersService.getAllUsers();
            if (Objects.nonNull(usersList)) {
                return ResponseEntity.ok(usersList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping( "/teachers")
    public ResponseEntity<List<UsersResponseDto>> getAllTeachers() {
        try {
            List<UsersResponseDto> usersList = usersService.getAllTeacher();
            if (Objects.nonNull(usersList)) {
                return ResponseEntity.ok(usersList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> createUser(@Valid @RequestBody UsersRequestDto userDto) {
        try {
            UsersResponseDto respond =  usersService.saveUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PostMapping("/registerParent")
    public ResponseEntity<?> createParent(@Valid @RequestBody ParentStudentRequestDto userDto) {
        try {
            List<ParentStudentResponseDto> respond =  usersService.createParent(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateUsers(@PathVariable String userId, @Valid @RequestBody UsersRequestDto userDto) {
        try {
            UsersResponseDto respond =  usersService.updateUser(UUID.fromString(userId), userDto);
            return ResponseEntity.ok(respond);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/changePassword/{userId}")
    public ResponseEntity<?> changePassword(@PathVariable String userId, @RequestParam String password) {
        try {
            UsersResponseDto respond =  usersService.changePassword(UUID.fromString(userId), password);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/activate/{id}")
    public ResponseEntity<?> activateUsers(@PathVariable String id) {
        try {
            usersService.activateUser(UUID.fromString(id));
            return ResponseEntity.ok("User Activate Successfully");
        }catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/suspend/{id}")
    public ResponseEntity<?> suspendUsers(@PathVariable String id) {
        try {
            usersService.deactivateUser(UUID.fromString(id));
            return ResponseEntity.ok("User Suspend Successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUsers(@PathVariable String id) {
        try {
            usersService.deleteUser(UUID.fromString(id));
            return ResponseEntity.ok().body("User delete Successful");
        }catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUsersById(@PathVariable String userId) {
        try {
            UsersResponseDto respond =  usersService.getUserById(UUID.fromString(userId));
            return ResponseEntity.ok(respond);
        }catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
