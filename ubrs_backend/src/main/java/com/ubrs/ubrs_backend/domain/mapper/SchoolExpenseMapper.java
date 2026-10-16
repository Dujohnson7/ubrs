package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolExpense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SchoolExpenseMapper {
    @Mapping(source = "id", target = "schoolExpenseId")
    SchoolExpenseResponseDto toSchoolExpenseDto(SchoolExpense schoolExpense);

    //@Mapping(source = "schoolExpenseId", target = "id")
    SchoolExpense toSchoolExpenseEntity(SchoolExpenseRequestDto schoolExpenseRequestDto);

    List<SchoolExpenseResponseDto> toSchoolExpenseDtoList(List<SchoolExpense> schoolExpense);
}
