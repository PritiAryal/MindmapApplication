package com.example.MindmapBackend.Service;

import com.example.MindmapBackend.Domain.Mindmap;
import com.example.MindmapBackend.Domain.Video;
import com.example.MindmapBackend.Repository.NodeRepository;
import com.example.MindmapBackend.Repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.repository.support.SimpleElasticsearchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Service
public class VideoService {
    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @Transactional
    public Video createVideo(String nodeId, Video video) {
        return nodeRepository.findById(nodeId)
                .map(node -> {
                    video.setNode(node);
                    return videoRepository.save(video);
                }).orElseThrow(() -> new RuntimeException("Node not found"));
    }
    @Transactional
    public List<Video> getVideosByNode(String nodeId) {
        return videoRepository.findByNodeId(nodeId);
    }

    @Transactional
    public Video getVideoById(String id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    @Transactional
    public Video updateVideo(String id, Video newVideo) {
        return videoRepository.findById(id)
                .map(video -> {
                    video.setTitle(newVideo.getTitle());
                    video.setUrl(newVideo.getUrl());
                    return videoRepository.save(video);
                }).orElseThrow(() -> new RuntimeException("Mindmap not found"));
    }

}
