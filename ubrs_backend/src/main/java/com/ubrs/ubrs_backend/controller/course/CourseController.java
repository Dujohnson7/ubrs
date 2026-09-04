package com.ubrs.ubrs_backend.controller.course;

import com.ubrs.ubrs_backend.domain.dto.course.CourseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.course.CourseResponseDto;
import com.ubrs.ubrs_backend.service.course.ICourseService;
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
@RequestMapping("/api/course")
public class CourseController {

    private final ICourseService courseService;


    @GetMapping("/all")
    public ResponseEntity<List<CourseResponseDto>> getAllCourse(){
        try {
            List<CourseResponseDto> courseDtoList = courseService.getAllCourses();
            if (Objects.nonNull(courseDtoList)) {
                return ResponseEntity.ok(courseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/primary")
    public ResponseEntity<List<CourseResponseDto>> getAllPrimaryCourses(){
        try {
            List<CourseResponseDto> courseDtoList = courseService.getAllCoursesBySchoolLevel(ESchoolLevel.PRIMARY);
            if (Objects.nonNull(courseDtoList)) {
                return ResponseEntity.ok(courseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }



    @GetMapping("/nursery")
    public ResponseEntity<List<CourseResponseDto>> getAllNurseryCourses(){
        try {
            List<CourseResponseDto> courseDtoList = courseService.getAllCoursesBySchoolLevel(ESchoolLevel.NURSERY);
            if (Objects.nonNull(courseDtoList)) {
                return ResponseEntity.ok(courseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/unassigned-courses/{classId}")
    public ResponseEntity<List<CourseResponseDto>> getUnassignedCourses(@PathVariable String classId){
        try {
            List<CourseResponseDto> courseDtoList = courseService.getAllCoursesNotYetAssign(UUID.fromString(classId));
            if (Objects.nonNull(courseDtoList)) {
                return ResponseEntity.ok(courseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }



    @GetMapping("/class/{classId}")
    public ResponseEntity<List<CourseResponseDto>> getCourseByClass(@PathVariable String classId){
        try {
            List<CourseResponseDto> courseDtoList = courseService.getAllCoursesByClass(UUID.fromString(classId));
            if (Objects.nonNull(courseDtoList)) {
                return ResponseEntity.ok(courseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }




    @GetMapping("/teacherCourses/{teacherId}")
    public ResponseEntity<List<CourseResponseDto>> getAllCoursesByTeacher(@PathVariable String teacherId){
        try {
            List<CourseResponseDto> courseDtoList = courseService.getAllCoursesByTeacher(UUID.fromString(teacherId));
            if (Objects.nonNull(courseDtoList)) {
                return ResponseEntity.ok(courseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseById(@PathVariable String courseId) {
        try {
            CourseResponseDto courseDto = courseService.getCourseById(UUID.fromString(courseId));
            return ResponseEntity.ok(courseDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCourse(@RequestBody CourseRequestDto courseDto) {
        try {
            CourseResponseDto course =  courseService.saveCourse(courseDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(course);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/update/{courseId}")
    public ResponseEntity<?> updateCourse(@RequestBody CourseRequestDto courseDto, @PathVariable String courseId) {
        try {
            CourseResponseDto course =  courseService.updateCourse(UUID.fromString(courseId), courseDto);
            return ResponseEntity.ok(course);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/delete/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable String courseId) {
        try {
            courseService.deleteCourse(UUID.fromString(courseId));
            return ResponseEntity.ok().body("Course has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
