package com.ubrs.ubrs_backend.controller.student;

import com.ubrs.ubrs_backend.domain.dto.student.StudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.student.StudentResponseDto;
import com.ubrs.ubrs_backend.service.student.IStudentService;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/student")
public class StudentController {

    private final IStudentService studentService;


    @GetMapping("/all")
    public ResponseEntity<List<StudentResponseDto>> getAllStudent(){
        try {
            List<StudentResponseDto> studentDtoList = studentService.getAllStudents();
            if (Objects.nonNull(studentDtoList)) {
                return ResponseEntity.ok(studentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/primary")
    public ResponseEntity<List<StudentResponseDto>> getAllPrimaryStudents(){
        try {
            List<StudentResponseDto> studentDtoList = studentService.getAllStudentsBySchoolLevel(ESchoolLevel.PRIMARY);
            if (Objects.nonNull(studentDtoList)) {
                return ResponseEntity.ok(studentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }



    @GetMapping("/nursery")
    public ResponseEntity<List<StudentResponseDto>> getAllNurseryStudents(){
        try {
            List<StudentResponseDto> studentDtoList = studentService.getAllStudentsBySchoolLevel(ESchoolLevel.NURSERY);
            if (Objects.nonNull(studentDtoList)) {
                return ResponseEntity.ok(studentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StudentResponseDto>> getAllStudentsByTeacher(@PathVariable String classId){
        try {
            List<StudentResponseDto> studentDtoList = studentService.getAllStudentsByClass(UUID.fromString(classId));
            if (Objects.nonNull(studentDtoList)) {
                return ResponseEntity.ok(studentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable String studentId) {
        try {
            StudentResponseDto studentDto = studentService.getStudentById(UUID.fromString(studentId));
            return ResponseEntity.ok(studentDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody StudentRequestDto studentDto) {
        try {
            StudentResponseDto student =  studentService.saveStudent(studentDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(student);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PostMapping("/import")
    public ResponseEntity<?> importStudents(@RequestParam("file") MultipartFile file, @RequestParam("classId") String classId) {
        try {
            studentService.importStudents(UUID.fromString(classId), file);
            return ResponseEntity.ok("Students imported successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PutMapping("/update/{studentId}")
    public ResponseEntity<?> updateStudent(@RequestBody StudentRequestDto studentDto, @PathVariable String studentId) {
        try {
            StudentResponseDto student =  studentService.updateStudent(UUID.fromString(studentId), studentDto);
            return ResponseEntity.ok(student);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/delete/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable String studentId) {
        try {
            studentService.deleteStudent(UUID.fromString(studentId));
            return ResponseEntity.ok().body("Student has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
