package com.example.MindmapBackend.Controller;

import com.example.MindmapBackend.Domain.Video;
import com.example.MindmapBackend.Service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/mindmaps")
public class VideoController {
    @Autowired
    private VideoService videoService;
    

    @PostMapping("/node/{nodeId}/video")
    public ResponseEntity<Video> createVideo(@PathVariable String nodeId, @RequestBody Video video) {
        Video newVideo = videoService.createVideo(nodeId, video);
        return new ResponseEntity<>(newVideo, HttpStatus.CREATED);
    }

    @GetMapping("/node/{nodeId}/video")
    public ResponseEntity<List<Video>> getVideosByNode(@PathVariable String nodeId) {
        List<Video> videos = videoService.getVideosByNode(nodeId);
        return new ResponseEntity<>(videos, HttpStatus.OK);
    }

    @GetMapping("video/{id}")
    public ResponseEntity<Video> getVideoById(@PathVariable String id) {
        Video video = videoService.getVideoById(id);
        return new ResponseEntity<>(video, HttpStatus.OK);
    }
}
