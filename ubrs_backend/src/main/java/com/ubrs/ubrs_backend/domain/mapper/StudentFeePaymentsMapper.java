package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsResponseDto;
import com.ubrs.ubrs_backend.domain.entity.StudentFeePayments;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {StudentFeePaymentsDetailMapper.class, SchoolFeesMapper.class},unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentFeePaymentsMapper {

    @Mapping(source = "id", target = "studentFeePaymentsId")
    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "student.studentCode", target = "studentCode")
    @Mapping(
            target = "studentName",
            expression = "java(studentFeePayments.getStudent().getFirstName() + \" \" + studentFeePayments.getStudent().getLastName())"
    )
    StudentFeePaymentsResponseDto toStudentFeePaymentsDto(StudentFeePayments studentFeePayments);

    //@Mapping(source = "studentId", target = "student.id")
    //@Mapping(source = "studentFeePaymentsId", target = "id")
    StudentFeePayments toStudentFeePaymentsEntity(StudentFeePaymentsRequestDto studentFeePaymentsRequestDto);

    List<StudentFeePaymentsResponseDto> toStudentFeePaymentsDtoList(List<StudentFeePayments> studentFeePayments);
}
