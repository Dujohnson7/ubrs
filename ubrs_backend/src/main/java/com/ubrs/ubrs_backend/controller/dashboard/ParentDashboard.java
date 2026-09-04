package com.ubrs.ubrs_backend.controller.dashboard;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentResponseDto;
import com.ubrs.ubrs_backend.service.academicYear.IAcademicYearService;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parentDashboard")
public class ParentDashboard {

    private final IUsersService usersService;
    private final IAcademicYearService academicYearService;

    @GetMapping("/students/{parentId}")
    public ResponseEntity<?> getChildren(@PathVariable String parentId) {
        try {
            List<ParentStudentResponseDto> children =
                    usersService.getStudentsByParentId(UUID.fromString(parentId));
            return ResponseEntity.ok(children);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/overview/{parentId}")
    public ResponseEntity<?> getOverview(@PathVariable String parentId) {
        try {
            List<ParentStudentResponseDto> children =
                    usersService.getStudentsByParentId(UUID.fromString(parentId));
            AcademicYearResponseDto activeYear = null;
            try {
                activeYear = academicYearService.getActiveAcademicYear();
            } catch (Exception ignored) {
                // no active year
            }

            Map<String, Object> body = new HashMap<>();
            body.put("children", children);
            body.put("childrenCount", children.size());
            body.put("activeAcademicYear", activeYear);
            return ResponseEntity.ok(body);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
