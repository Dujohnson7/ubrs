package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.ERole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class Users extends AbstractBaseEntity {

    @Column(length = 200)
    private String profile;

    @Column(length = 200)
    private String names;

    @Column(length = 13)
    private String phone;

    @Column(length = 150, unique = true)
    private String email;

    @Column(length = 200)
    private String password;

    @Column(length = 15)
    @Enumerated(EnumType.STRING)
    private ERole role;

    @Column(length = 200)
    private String signature;

    private boolean userStatus;

    private boolean isFirstTime;
}
