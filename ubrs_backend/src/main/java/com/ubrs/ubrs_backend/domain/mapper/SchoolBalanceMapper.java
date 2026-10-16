package com.ubrs.ubrs_backend.domain.mapper;


import com.ubrs.ubrs_backend.domain.dto.schoolBalance.SchoolBalanceResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolBalance;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SchoolBalanceMapper {
    SchoolBalanceResponseDto toSchoolBalanceDto(SchoolBalance schoolBalance);

    List<SchoolBalanceResponseDto> toSchoolBalanceDtoList(List<SchoolBalance> schoolBalances);
}
