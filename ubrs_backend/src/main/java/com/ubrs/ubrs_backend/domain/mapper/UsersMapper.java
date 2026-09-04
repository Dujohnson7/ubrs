package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.users.UsersRequestDto;
import com.ubrs.ubrs_backend.domain.dto.users.UsersResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UsersMapper {
    @Mapping(source = "id", target = "userId")
    UsersResponseDto toUsersDto(Users users);

    //@Mapping(source = "userId", target = "id")
    Users toUsersEntity(UsersRequestDto studentRequestDto);

    List<UsersResponseDto> toUsersDtoList(List<Users> users);
}
