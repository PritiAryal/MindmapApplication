package com.example.MindmapBackend.Repository;


import com.example.MindmapBackend.Domain.Applicationuser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface ApplicationuserRepository extends JpaRepository<Applicationuser, Integer> {
    Optional<Applicationuser> findByName(String name);

    Optional<Applicationuser> findByNameAndEmail(String name, String email);
}
