package com.example.MindmapBackend.Repository;

import com.example.MindmapBackend.Domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AccountRepository extends JpaRepository<Account, String> {
}

