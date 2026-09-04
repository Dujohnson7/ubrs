package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.student.StudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.student.StudentResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper {
    @Mapping(source = "id", target = "studentId")
    @Mapping(source = "schoolClass.id", target = "schoolClassId")
    @Mapping(source = "schoolClass.name", target = "schoolClassName")
    StudentResponseDto toStudentDto(Student student);

    //@Mapping(source = "studentId", target = "id")
    @Mapping(source = "schoolClassId", target = "schoolClass.id")
    Student toStudentEntity(StudentRequestDto studentRequestDto);

    List<StudentResponseDto> toStudentDtoList(List<Student> student);
}
