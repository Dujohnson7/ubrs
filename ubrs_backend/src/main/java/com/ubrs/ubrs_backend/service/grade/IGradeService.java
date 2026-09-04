package com.ubrs.ubrs_backend.service.grade;

import com.ubrs.ubrs_backend.domain.dto.grade.GradeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.grade.GradeResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Grade;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeDetailProjection;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeStatusProjection;
import com.ubrs.ubrs_backend.util.ETerm;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IGradeService {
    GradeResponseDto saveGrade(GradeRequestDto gradeRequestDto);
    GradeResponseDto updateGrade(UUID gradeId, GradeRequestDto gradeRequestDto);
    void deleteGrade(UUID gradeId);
    void importGrades(GradeRequestDto requestDto, MultipartFile file);

    void submitGrade(UUID gradeId);
    void approveGrade(UUID gradeId);
    void rejectGrade(UUID gradeId, String feedback);

    GradeResponseDto getGradeById(UUID gradeId);
    List<GradeResponseDto> getAllGrades();
    List<GradeResponseDto> getAllGradesByTeacher(UUID teacherId);
    List<GradeResponseDto> getAllGradesByClass(UUID classId);


    List<ClassGradeStatusProjection> getClassGradeStatus();
    List<ClassGradeDetailProjection> getClassGradeDetails(UUID classId, UUID academicYearId, ETerm term);
    List<GradeResponseDto> getAllByAcademicYearAndTermAndSchoolClassAndCourse(UUID academicYearId, ETerm term, UUID schoolClassId, UUID courseId);

}
