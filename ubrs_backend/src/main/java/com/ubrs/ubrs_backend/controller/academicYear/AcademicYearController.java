package com.ubrs.ubrs_backend.controller.academicYear;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearRequestDto;
import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.service.academicYear.IAcademicYearService;
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
@RequestMapping("/api/academicYear")
public class AcademicYearController {

    private final IAcademicYearService academicYearService;


    @GetMapping("/all")
    public ResponseEntity<List<AcademicYearResponseDto>> getAllAcademicYear(){
        try {
            List<AcademicYearResponseDto> academicYearDtoList = academicYearService.getAllAcademicYears();
            if (Objects.nonNull(academicYearDtoList)) {
                return ResponseEntity.ok(academicYearDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getAllValidAcademicYears(){
        try {
            AcademicYearResponseDto academicYearDto = academicYearService.getActiveAcademicYear();
            return ResponseEntity.ok(academicYearDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{academicYearId}")
    public ResponseEntity<?> getAcademicYearById(@PathVariable String academicYearId) {
        try {
            AcademicYearResponseDto academicYearDto = academicYearService.getAcademicYearById(UUID.fromString(academicYearId));
            return ResponseEntity.ok(academicYearDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAcademicYear(@RequestBody AcademicYearRequestDto academicYearDto) {
        try {
            AcademicYearResponseDto academicYear =  academicYearService.saveAcademicYear(academicYearDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(academicYear);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PatchMapping("/activateAcademic/{academicYearId}")
    public ResponseEntity<?> activateAcademicYear(@PathVariable String academicYearId) {
        try {
            academicYearService.activateAcademicYear(UUID.fromString(academicYearId));
            return ResponseEntity.ok().body("Academic Year has been activate Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PatchMapping("/completeAcademic/{academicYearId}")
    public ResponseEntity<?> completeAcademicYear(@PathVariable String academicYearId) {
        try {
            academicYearService.completeAcademicYear(UUID.fromString(academicYearId));
            return ResponseEntity.ok().body("Academic Year has been activate Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PutMapping("/update/{academicYearId}")
    public ResponseEntity<?> updateAcademicYear(@RequestBody AcademicYearRequestDto academicYearDto, @PathVariable String academicYearId) {
        try {
            AcademicYearResponseDto academicYear =  academicYearService.updateAcademicYear(UUID.fromString(academicYearId), academicYearDto);
            return ResponseEntity.ok(academicYear);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @DeleteMapping("/delete/{academicYearId}")
    public ResponseEntity<?> deleteAcademicYear(@PathVariable String academicYearId) {
        try {
            academicYearService.deleteAcademicYearById(UUID.fromString(academicYearId));
            return ResponseEntity.ok().body("Academic Year delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


}
