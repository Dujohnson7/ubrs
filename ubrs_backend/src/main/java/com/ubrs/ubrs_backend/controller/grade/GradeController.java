package com.ubrs.ubrs_backend.controller.grade;

import com.ubrs.ubrs_backend.domain.dto.grade.GradeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.grade.GradeResponseDto;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeDetailProjection;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeStatusProjection;
import com.ubrs.ubrs_backend.service.grade.IGradeService;
import com.ubrs.ubrs_backend.util.ETerm;
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
@RequestMapping("/api/grade")
public class GradeController {

    private final IGradeService gradeService;


    @GetMapping("/all")
    public ResponseEntity<List<GradeResponseDto>> getAllGrade(){
        try {
            List<GradeResponseDto> gradeDtoList = gradeService.getAllGrades();
            if (Objects.nonNull(gradeDtoList)) {
                return ResponseEntity.ok(gradeDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<GradeResponseDto>> getAllGradeByTeacher(@PathVariable String teacherId){
        try {
            List<GradeResponseDto> gradeDtoList = gradeService.getAllGradesByTeacher(UUID.fromString(teacherId));
            if (Objects.nonNull(gradeDtoList)) {
                return ResponseEntity.ok(gradeDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/class/{classId}")
    public ResponseEntity<List<GradeResponseDto>> getAllGradesByClass(@PathVariable String classId){
        try {
            List<GradeResponseDto> gradeDtoList = gradeService.getAllGradesByClass(UUID.fromString(classId));
            if (Objects.nonNull(gradeDtoList)) {
                return ResponseEntity.ok(gradeDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/{gradeId}")
    public ResponseEntity<?> getGradeById(@PathVariable String gradeId) {
        try {
            GradeResponseDto gradeDto = gradeService.getGradeById(UUID.fromString(gradeId));
            return ResponseEntity.ok(gradeDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerGrade(@RequestBody GradeRequestDto gradeDto) {
        try {
            GradeResponseDto grade =  gradeService.saveGrade(gradeDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(grade);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PostMapping("/import")
    public ResponseEntity<?> importGrades(@RequestPart("file") MultipartFile file, @RequestPart GradeRequestDto requestDto) {
        try {
            gradeService.importGrades(requestDto, file);
            return ResponseEntity.ok("Grades imported successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @DeleteMapping("/submitGrade/{gradeId}")
    public ResponseEntity<?> submitGrade(@PathVariable String gradeId) {
        try {
            gradeService.submitGrade(UUID.fromString(gradeId));
            return ResponseEntity.ok().body("Grade has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/approveGrade/{gradeId}")
    public ResponseEntity<?> approveGrade(@PathVariable String gradeId) {
        try {
            gradeService.approveGrade(UUID.fromString(gradeId));
            return ResponseEntity.ok().body("Grade has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/rejectGrade/{gradeId}")
    public ResponseEntity<?> rejectGrade(@PathVariable String gradeId,@RequestParam String feedback) {
        try {
            gradeService.rejectGrade(UUID.fromString(gradeId),feedback);
            return ResponseEntity.ok().body("Grade has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/update/{gradeId}")
    public ResponseEntity<?> updateGrade(@RequestBody GradeRequestDto gradeDto, @PathVariable String gradeId) {
        try {
            GradeResponseDto grade =  gradeService.updateGrade(UUID.fromString(gradeId), gradeDto);
            return ResponseEntity.ok(grade);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/delete/{gradeId}")
    public ResponseEntity<?> deleteGrade(@PathVariable String gradeId) {
        try {
            gradeService.deleteGrade(UUID.fromString(gradeId));
            return ResponseEntity.ok().body("Grade has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }





    @GetMapping("/classGrade")
    public ResponseEntity<List<ClassGradeStatusProjection>> getAllClassGrade(){
        try {
            List<ClassGradeStatusProjection> gradesList = gradeService.getClassGradeStatus();
            if (Objects.nonNull(gradesList)) {
                return ResponseEntity.ok(gradesList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }



    @GetMapping("/classGrade/details")
    public ResponseEntity<List<ClassGradeDetailProjection>> getClassGradeDetails(@RequestParam UUID classId, @RequestParam UUID academicYearId, @RequestParam ETerm term){
        try {
            List<ClassGradeDetailProjection> gradesList = gradeService.getClassGradeDetails(classId, academicYearId, term);
            if (Objects.nonNull(gradesList)) {
                return ResponseEntity.ok(gradesList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }


    @GetMapping("/studentGradeByTerm")
    public ResponseEntity<List<GradeResponseDto>> getAllByAcademicYearAndTermAndSchoolClassAndCourse(@RequestParam UUID academicYearId, @RequestParam ETerm term, @RequestParam UUID classId, @RequestParam UUID courseId){
        try {
            List<GradeResponseDto> gradesList = gradeService.getAllByAcademicYearAndTermAndSchoolClassAndCourse(academicYearId, term, classId,courseId);
            if (Objects.nonNull(gradesList)) {
                return ResponseEntity.ok(gradesList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }
}
