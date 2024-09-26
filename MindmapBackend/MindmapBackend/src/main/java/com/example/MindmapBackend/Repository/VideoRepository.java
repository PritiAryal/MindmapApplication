package com.example.MindmapBackend.Repository;

import com.example.MindmapBackend.Domain.Mindmap;
import com.example.MindmapBackend.Domain.Node;
import com.example.MindmapBackend.Domain.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VideoRepository extends JpaRepository<Video, String> { //UUID
    List<Video> findByNodeId(String nodeId);

}
