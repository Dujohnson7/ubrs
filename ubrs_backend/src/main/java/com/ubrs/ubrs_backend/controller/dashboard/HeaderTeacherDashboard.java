package com.ubrs.ubrs_backend.controller.dashboard;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.AverageMarksBySubjectDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.GradeDistributionDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.MarksSubmissionTrendsDto;
import com.ubrs.ubrs_backend.service.academicYear.IAcademicYearService;
import com.ubrs.ubrs_backend.service.course.ICourseService;
import com.ubrs.ubrs_backend.service.dashboard.IHeaderTeacherDashboardService;
import com.ubrs.ubrs_backend.service.student.IStudentService;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/headerTeacherDashboard")
public class HeaderTeacherDashboard {

    private final IStudentService studentService;
    private final IUsersService usersService;
    private final IAcademicYearService academicYearService;
    private final ICourseService courseService;
    private final IHeaderTeacherDashboardService headerTeacherDashboardService;


    @GetMapping("/totalStudents")
    public ResponseEntity<Long> getTotalStudent() {
        try {
            long respond = studentService.totalStudents();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalStudents/nursery")
    public ResponseEntity<Long> totalNurseryStudents() {
        try {
            long respond = studentService.totalStudentsBySchoolLevel(ESchoolLevel.NURSERY);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalStudents/primary")
    public ResponseEntity<Long> totalPrimaryStudents() {
        try {
            long respond = studentService.totalStudentsBySchoolLevel(ESchoolLevel.PRIMARY);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/totalTeacher")
    public ResponseEntity<Long> getTotalTeacher() {
        try {
            long respond = usersService.totalTeacher();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/totalClassTeacher")
    public ResponseEntity<Long> getTotalClassTeacher() {
        try {
            long respond = usersService.totalClassTeacher();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/totalAcademicYear")
    public ResponseEntity<Long> getTotalAcademicYear() {
        try {
            long respond = academicYearService.totalAcademicYears();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/academicYear/active")
    public ResponseEntity<?> getAllActiveAcademicYears(){
        try {
            AcademicYearResponseDto academicYearDto = academicYearService.getActiveAcademicYear();
            return ResponseEntity.ok(academicYearDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/totalCourse")
    public ResponseEntity<Long> getTotalCourse() {
        try {
            long respond = courseService.totalCourses();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalCourse/nursery")
    public ResponseEntity<Long> getTotalCourseByNursery() {
        try {
            long respond = courseService.totalCourseBySchoolLevel(ESchoolLevel.NURSERY);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalCourse/primary")
    public ResponseEntity<Long> getTotalCourseByPrimary() {
        try {
            long respond = courseService.totalCourseBySchoolLevel(ESchoolLevel.PRIMARY);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/averageMarksBySubject")
    public ResponseEntity<AverageMarksBySubjectDto> getAverageMarksBySubject() {
        try {
            AverageMarksBySubjectDto data = headerTeacherDashboardService.getAverageMarksBySubject();
            return ResponseEntity.ok(data);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/marksSubmissionTrends")
    public ResponseEntity<MarksSubmissionTrendsDto> getMarksSubmissionTrends() {
        try {
            MarksSubmissionTrendsDto data = headerTeacherDashboardService.getMarksSubmissionTrends();
            return ResponseEntity.ok(data);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/gradeDistribution")
    public ResponseEntity<GradeDistributionDto> getGradeDistribution() {
        try {
            GradeDistributionDto data = headerTeacherDashboardService.getGradeDistribution();
            return ResponseEntity.ok(data);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}
