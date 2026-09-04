package com.ubrs.ubrs_backend.service.student;

import com.ubrs.ubrs_backend.domain.dto.student.StudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.student.StudentResponseDto;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IStudentService {
    StudentResponseDto getStudentById(UUID studentId);
    StudentResponseDto saveStudent(StudentRequestDto studentRequestDto);
    StudentResponseDto updateStudent(UUID studentId, StudentRequestDto studentRequestDto);
    void deleteStudent(UUID studentId);
    void importStudents(UUID classId, MultipartFile file);
    List<StudentResponseDto> getAllStudents();
    List<StudentResponseDto> getAllStudentsBySchoolLevel(ESchoolLevel schoolLevel);
    List<StudentResponseDto> getAllStudentsByClass(UUID classId);
    List<StudentResponseDto> getAllStudentsByClassTeacher(UUID teacherId);
    long totalStudents();
    long totalStudentsBySchoolLevel(ESchoolLevel schoolLevel);
    long totalStudentsByClass(UUID classId);
}
