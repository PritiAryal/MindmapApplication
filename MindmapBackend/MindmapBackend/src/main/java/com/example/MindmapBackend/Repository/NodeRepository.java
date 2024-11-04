package com.example.MindmapBackend.Repository;

import com.example.MindmapBackend.Domain.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NodeRepository extends JpaRepository<Node, String> {//UUID
    List<Node> findByMindmaps_Id(Integer mindmapId);

    @Query("SELECT n FROM Node n JOIN n.mindmaps m WHERE m.id = :mindmapId")
    List<Node> findByMindmap_Id(@Param("mindmapId") Integer mindmapId);

    Optional<Node> findById(String id);
}
