package com.ubrs.ubrs_backend.domain.dto.parent;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ParentStudentRequestDto {

    private String names;

    private String email;

    private String phone;

    //private UUID studentId;
    private List<UUID> studentIds;
}
