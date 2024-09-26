package com.example.MindmapBackend.Service;

import com.example.MindmapBackend.Domain.Node;
import com.example.MindmapBackend.Domain.Video;
import com.example.MindmapBackend.Repository.MindmapRepository;
import com.example.MindmapBackend.Repository.NodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NodeService {
    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private MindmapRepository mindmapRepository;

    public Node createNode(Integer mindmapId, Node node) {
        return mindmapRepository.findById(mindmapId)
                .map(mindmap -> {
                    node.setMindmap(mindmap);
                    return nodeRepository.save(node);
                }).orElseThrow(() -> new RuntimeException("Not found Stage with id = " + mindmapId));
    }


    public List<Node> getNodesByMindMap(Integer mindmapId) {
        return nodeRepository.findByMindmap_Id(mindmapId);
    }

    @Transactional
    public Node getNodeById(String id) {
        return nodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Node not found"));
    }
        public Node updateNode(String id, Map<String, Object> updates) {
            return nodeRepository.findById(id)
                    .map(node -> {
                        if (updates.containsKey("label")) {
                            node.setLabel((String) updates.get("label"));
                        }
                        if (updates.containsKey("x")) {
                            // Convert Integer to Double if needed
                            Object xValue = updates.get("x");
                            if (xValue instanceof Integer) {
                                node.setX(((Integer) xValue).doubleValue());
                            } else if (xValue instanceof Double) {
                                node.setX((Double) xValue);
                            }
                        }
                        if (updates.containsKey("y")) {
                            // Convert Integer to Double if needed
                            Object yValue = updates.get("y");
                            if (yValue instanceof Integer) {
                                node.setY(((Integer) yValue).doubleValue());
                            } else if (yValue instanceof Double) {
                                node.setY((Double) yValue);
                            }
                        }
                        if (updates.containsKey("parentId")) {
                            node.setParentId((String) updates.get("parentId"));
                        }
                        if (updates.containsKey("expanded")) {
                            node.setExpanded((Boolean) updates.get("expanded"));
                        }
                        return nodeRepository.save(node);
                    })
                    .orElseThrow(() -> new RuntimeException("Node not found"));
        }
}
