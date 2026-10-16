package com.ubrs.ubrs_backend.controller.schoolFees;

import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesResponseDto;
import com.ubrs.ubrs_backend.service.schoolFees.ISchoolFeesService;
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
@RequestMapping("/api/schoolFees")
public class SchoolFeesController {

    private final ISchoolFeesService  schoolFeesService;

    @GetMapping("/all")
    public ResponseEntity<List<SchoolFeesResponseDto>> getAllSchoolFees(){
        try {
            List<SchoolFeesResponseDto> schoolFeesDtoList = schoolFeesService.getAllSchoolFees();
            if (Objects.nonNull(schoolFeesDtoList)) {
                return ResponseEntity.ok(schoolFeesDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/{schoolFeesId}")
    public ResponseEntity<?> getSchoolFeesById(@PathVariable String schoolFeesId) {
        try {
            SchoolFeesResponseDto schoolFeesDto = schoolFeesService.getSchoolFees(UUID.fromString(schoolFeesId));
            return ResponseEntity.ok(schoolFeesDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSchoolFees(@RequestBody SchoolFeesRequestDto schoolFeesDto) {
        try {
            SchoolFeesResponseDto schoolFees =  schoolFeesService.saveSchoolFees(schoolFeesDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(schoolFees);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update/{schoolFeesId}")
    public ResponseEntity<?> updateSchoolFees(@RequestBody SchoolFeesRequestDto schoolFeesDto, @PathVariable String schoolFeesId) {
        try {
            SchoolFeesResponseDto schoolFees =  schoolFeesService.updateSchoolFees(UUID.fromString(schoolFeesId), schoolFeesDto);
            return ResponseEntity.ok(schoolFees);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{schoolFeesId}")
    public ResponseEntity<?> deleteSchoolFees(@PathVariable String schoolFeesId) {
        try {
            schoolFeesService.deleteSchoolFees(UUID.fromString(schoolFeesId));
            return ResponseEntity.ok().body("School Fees has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
