package com.example.MindmapBackend.Domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
    public class PasteLinkRequest {
        //private UUID nodeId;
    private String nodeId = UUID.randomUUID().toString();
        //private UUID targetMindmapId;
    private Integer targetMindmapId;
    private String newParentId = UUID.randomUUID().toString();

    }
