package com.example.MindmapBackend.Repository;


import com.example.MindmapBackend.Domain.Applicationuser;
import com.example.MindmapBackend.Domain.Mindmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MindmapRepository extends JpaRepository<Mindmap, Integer> {
    List<Mindmap> findByApplicationuserId(Integer userId);

    List<Mindmap> findByApplicationuserIdAndTitleContaining(Integer userId, String title);
}
