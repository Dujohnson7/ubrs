package com.ubrs.ubrs_backend.domain.dto.users;

import com.ubrs.ubrs_backend.util.ERole;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
public class UsersRequestDto {

    private String profile;

    private String names;

    private String phone;

    private String email;

    private String password;

    private ERole role;

    private String signature;

    private boolean userStatus;

    private boolean isFirstTime;

    private MultipartFile profileFile;
}