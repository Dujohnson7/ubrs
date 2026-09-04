package com.ubrs.ubrs_backend.controller.dashboard;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentResponseDto;
import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.domain.mapper.SchoolClassMapper;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.service.academicYear.IAcademicYearService;
import com.ubrs.ubrs_backend.service.courseAssignment.ICourseAssignmentService;
import com.ubrs.ubrs_backend.service.student.IStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/teacherDashboard")
public class TeacherDashboard {

    private final ICourseAssignmentService courseAssignmentService;
    private final IStudentService studentService;
    private final IAcademicYearService academicYearService;
    private final ISchoolClassRepository schoolClassRepository;
    private final SchoolClassMapper schoolClassMapper;

    @GetMapping("/totalEnrolledCourse/{teacherId}")
    public ResponseEntity<Long> totalCourseByTeacher(@PathVariable String teacherId) {
        try {
            long total = courseAssignmentService.totalCourseByTeacher(UUID.fromString(teacherId));
            return ResponseEntity.ok(total);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/overview/{teacherId}")
    public ResponseEntity<?> getOverview(@PathVariable String teacherId) {
        try {
            UUID id = UUID.fromString(teacherId);
            List<CourseAssignmentResponseDto> assignments =
                    courseAssignmentService.getAllCourseAssignmentsByTeacher(id);

            SchoolClass classAsTeacher =
                    schoolClassRepository.findSchoolClassByClassTeacher_IdAndIsDeleted(id, false);
            SchoolClassResponseDto classTeacherClass = null;
            long classTeacherStudentCount = 0;
            if (classAsTeacher != null) {
                classTeacherClass = schoolClassMapper.toSchoolClassDto(classAsTeacher);
                classTeacherStudentCount = studentService.getAllStudentsByClass(classAsTeacher.getId()).size();
            }

            AcademicYearResponseDto activeYear = null;
            try {
                activeYear = academicYearService.getActiveAcademicYear();
            } catch (Exception ignored) {
                // no active year
            }

            Map<String, Object> body = new HashMap<>();
            body.put("coursesCount", assignments.size());
            body.put("assignments", assignments);
            body.put("classTeacherClass", classTeacherClass);
            body.put("classTeacherStudentCount", classTeacherStudentCount);
            body.put("activeAcademicYear", activeYear);
            return ResponseEntity.ok(body);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
