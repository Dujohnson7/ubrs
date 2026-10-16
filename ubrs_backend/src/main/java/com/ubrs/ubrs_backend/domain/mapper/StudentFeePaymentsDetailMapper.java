package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsDetailRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsDetailResponseDto;
import com.ubrs.ubrs_backend.domain.entity.StudentFeePaymentsDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {StudentFeePaymentsMapper.class},unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentFeePaymentsDetailMapper {

    @Mapping(source = "id", target = "studentFeePaymentsDetailId")
    StudentFeePaymentsDetailResponseDto toStudentFeePaymentsDetailDto(StudentFeePaymentsDetail StudentFeePaymentsDetail);

    //@Mapping(source = "studentFeePaymentsDetailId", target = "id")
    StudentFeePaymentsDetail toStudentFeePaymentsDetailEntity(StudentFeePaymentsDetailRequestDto requestDto);
}
