package com.ubrs.ubrs_backend.service.users;

import com.ubrs.ubrs_backend.domain.entity.Users;
import com.ubrs.ubrs_backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailServiceImpl  implements UserDetailsService {

    private final IUserRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user = usersRepository.findUsersByEmailAndUserStatusAndIsDeleted(email, true, Boolean.FALSE)
                .orElseThrow(() -> new UsernameNotFoundException("USER NOT FOUND " + email));

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new UserDetailsImpl(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(authority),
                user.getId()
        );
    }
}
