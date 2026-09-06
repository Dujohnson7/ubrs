package com.ubrs.ubrs_backend.service.schoolClass;

import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassResponseDto;
import com.ubrs.ubrs_backend.util.ESchoolLevel;

import java.util.List;
import java.util.UUID;

public interface ISchoolClassService {
    SchoolClassResponseDto getSchoolClassById(UUID classId);
    SchoolClassResponseDto saveClass(SchoolClassRequestDto schoolClassRequestDto);
    SchoolClassResponseDto updateClass(UUID classId, SchoolClassRequestDto schoolClassRequestDto);
    void deleteClass(UUID classId);
    List<SchoolClassResponseDto> getAllClasses();
    List<SchoolClassResponseDto> getClassesTaughtByTeacher(UUID teacherId);
    List<SchoolClassResponseDto> getAllClassesBySchoolLevel(ESchoolLevel schoolLevel);
    long totalClassesBySchoolLevel(ESchoolLevel schoolLevel);
    long totalClasses();
}
