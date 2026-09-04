package com.ubrs.ubrs_backend.controller.courseAssignment;

import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentResponseDto;
import com.ubrs.ubrs_backend.service.courseAssignment.ICourseAssignmentService;
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
@RequestMapping("/api/courseAssignment")
public class CourseAssignmentController {


    private final ICourseAssignmentService courseAssignmentService;


    @GetMapping("/all")
    public ResponseEntity<List<CourseAssignmentResponseDto>> getAllCourseAssignment(){
        try {
            List<CourseAssignmentResponseDto> courseAssignmentDtoList = courseAssignmentService.getAllCourseAssignments();
            if (Objects.nonNull(courseAssignmentDtoList)) {
                return ResponseEntity.ok(courseAssignmentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/{courseAssignmentId}")
    public ResponseEntity<?> getCourseAssignmentById(@PathVariable String courseAssignmentId) {
        try {
            CourseAssignmentResponseDto courseAssignmentDto = courseAssignmentService.getCourseAssignmentById(UUID.fromString(courseAssignmentId));
            return ResponseEntity.ok(courseAssignmentDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCourseAssignment(@RequestBody CourseAssignmentRequestDto courseAssignmentDto) {
        try {
            CourseAssignmentResponseDto courseAssignment =  courseAssignmentService.saveCourseAssignment(courseAssignmentDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(courseAssignment);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PatchMapping("/closeCourseAssignment/{courseAssignmentId}")
    public ResponseEntity<?> closeCourseAssignment(@PathVariable String courseAssignmentId) {
        try {
            courseAssignmentService.closeCourseAssignment(UUID.fromString(courseAssignmentId));
            return ResponseEntity.ok().body("Course Assignment has been closed Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update/{courseAssignmentId}")
    public ResponseEntity<?> updateCourseAssignment(@RequestBody CourseAssignmentRequestDto courseAssignmentDto, @PathVariable String courseAssignmentId) {
        try {
            CourseAssignmentResponseDto courseAssignment =  courseAssignmentService.updateCourseAssignment(UUID.fromString(courseAssignmentId), courseAssignmentDto);
            return ResponseEntity.ok(courseAssignment);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/delete/{courseAssignmentId}")
    public ResponseEntity<?> deleteCourseAssignment(@PathVariable String courseAssignmentId) {
        try {
            courseAssignmentService.deleteCourseAssignment(UUID.fromString(courseAssignmentId));
            return ResponseEntity.ok().body("Course Assignment delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseAssignmentResponseDto>> getAllCourseAssignmentsByTeacher(@PathVariable String teacherId){
        try {
            List<CourseAssignmentResponseDto> courseAssignmentDtoList = courseAssignmentService.getAllCourseAssignmentsByTeacher(UUID.fromString(teacherId));
            if (Objects.nonNull(courseAssignmentDtoList)) {
                return ResponseEntity.ok(courseAssignmentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


}
