package com.ubrs.ubrs_backend.controller.schoolClass;

import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassResponseDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import com.ubrs.ubrs_backend.service.schoolClass.ISchoolClassService;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
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
@RequestMapping("/api/schoolClass")
public class SchoolClassController {


    private final ISchoolClassService schoolClassService;
    private final IUsersService usersService;


    @GetMapping("/all")
    public ResponseEntity<List<SchoolClassResponseDto>> getAllSchoolClass(){
        try {
            List<SchoolClassResponseDto> schoolClassDtoList = schoolClassService.getAllClasses();
            if (Objects.nonNull(schoolClassDtoList)) {
                return ResponseEntity.ok(schoolClassDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/primary")
    public ResponseEntity<List<SchoolClassResponseDto>> getAllPrimaryClasses(){
        try {
            List<SchoolClassResponseDto> schoolClassDtoList = schoolClassService.getAllClassesBySchoolLevel(ESchoolLevel.PRIMARY);
            if (Objects.nonNull(schoolClassDtoList)) {
                return ResponseEntity.ok(schoolClassDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }



    @GetMapping("/nursery")
    public ResponseEntity<List<SchoolClassResponseDto>> getAllNurseryClasses(){
        try {
            List<SchoolClassResponseDto> schoolClassDtoList = schoolClassService.getAllClassesBySchoolLevel(ESchoolLevel.NURSERY);
            if (Objects.nonNull(schoolClassDtoList)) {
                return ResponseEntity.ok(schoolClassDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/{classId}")
    public ResponseEntity<?> getSchoolClassById(@PathVariable String classId) {
        try {
            SchoolClassResponseDto schoolClassDto = schoolClassService.getSchoolClassById(UUID.fromString(classId));
            return ResponseEntity.ok(schoolClassDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSchoolClass(@RequestBody SchoolClassRequestDto schoolClassDto) {
        try {
            SchoolClassResponseDto schoolClass =  schoolClassService.saveClass(schoolClassDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(schoolClass);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/update/{schoolClassId}")
    public ResponseEntity<?> updateSchoolClass(@RequestBody SchoolClassRequestDto schoolClassDto, @PathVariable String schoolClassId) {
        try {
            SchoolClassResponseDto schoolClass =  schoolClassService.updateClass(UUID.fromString(schoolClassId), schoolClassDto);
            return ResponseEntity.ok(schoolClass);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/delete/{schoolClassId}")
    public ResponseEntity<?> deleteSchoolClass(@PathVariable String schoolClassId) {
        try {
            schoolClassService.deleteClass(UUID.fromString(schoolClassId));
            return ResponseEntity.ok().body("Class has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @GetMapping( "/teachers")
    public ResponseEntity<List<UsersResponseDto>> getAllTeacherWhoAreNotHeader() {
        try {
            List<UsersResponseDto> usersList = usersService.getAllTeacherWhoAreNotHeader();
            if (Objects.nonNull(usersList)) {
                return ResponseEntity.ok(usersList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

}
