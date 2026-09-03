package com.ubrs.ubrs_backend.domain.dto.users;

import com.ubrs.ubrs_backend.util.ERole;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UsersRequest {

    private String profile;

    private String names;

    private String phone;

    private String email;

    private String password;

    private ERole role;

    private String signature;

    private boolean userStatus;

    private boolean isFirstTime;
}