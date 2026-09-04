package com.ubrs.ubrs_backend.domain.dto.users;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginResponseDto {
    private UsersResponseDto user;
    private String token;
    private String message;
}
