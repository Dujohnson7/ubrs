package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeResponseDto;
import com.ubrs.ubrs_backend.domain.entity.OtherIncome;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OtherIncomeMapper {
    @Mapping(source = "id", target = "otherIncomeId")
    OtherIncomeResponseDto toOtherIncomeDto(OtherIncome otherIncome);

    List<OtherIncomeResponseDto> toOtherIncomeDtoList(List<OtherIncome> otherIncomes);
}
