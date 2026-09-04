package com.ubrs.ubrs_backend.domain.dto.users;

import com.ubrs.ubrs_backend.util.ERole;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class UsersResponseDto {

    private UUID userId;

    private String profile;

    private String names;

    private String phone;

    private String email;

    private ERole role;

    private String signature;

    private boolean userStatus;

    private boolean isFirstTime;
}