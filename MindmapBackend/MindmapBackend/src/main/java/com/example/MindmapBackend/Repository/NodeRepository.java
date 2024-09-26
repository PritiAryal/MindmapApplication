package com.example.MindmapBackend.Repository;

import com.example.MindmapBackend.Domain.Node;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NodeRepository extends JpaRepository<Node, String> {//UUID
    List<Node> findByMindmap_Id(Integer mindmapId);
}
