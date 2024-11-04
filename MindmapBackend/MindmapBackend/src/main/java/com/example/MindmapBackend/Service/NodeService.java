package com.example.MindmapBackend.Service;

import com.example.MindmapBackend.Domain.Node;
import com.example.MindmapBackend.Repository.MindmapRepository;
import com.example.MindmapBackend.Repository.NodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class NodeService {
    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private MindmapRepository mindmapRepository;

//    public Node createNode(Integer mindmapId, Node node) {
//        return mindmapRepository.findById(mindmapId)
//                .map(mindmap -> {
//                    node.setMindmap(mindmap);
//                    return nodeRepository.save(node);
//                }).orElseThrow(() -> new RuntimeException("Not found Stage with id = " + mindmapId));
//    }

//    public Node findById(String id) {
//        return nodeRepository.findById(id).orElse(null);
//    }
//
    public void saveNode(Node node) {
        nodeRepository.save(node);
    }

    public Node createNode(Integer mindmapId, Node node) {
        return mindmapRepository.findById(mindmapId)
                .map(mindmap -> {
                    node.getMindmaps().add(mindmap);
                    mindmap.getNodes().add(node);
                    return nodeRepository.save(node);
                }).orElseThrow(() -> new RuntimeException("Not found Mindmap with id = " + mindmapId));
    }




    public List<Node> getNodesByMindMap(Integer mindmapId) {
        return nodeRepository.findByMindmap_Id(mindmapId);
    }

    @Transactional
    public Node getNodeById(String id) {
        return nodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Node with ID " + id + " not found"));
    }
        public Node updateNode(String id, Map<String, Object> updates) {
            return nodeRepository.findById(id)
                    .map(node -> {
                        boolean positionUpdated = false;

                        if (updates.containsKey("label")) {
                            node.setLabel((String) updates.get("label"));
                        }
                        if (updates.containsKey("x")) {
                            Object xValue = updates.get("x");
                            if (xValue instanceof Integer) {
                                node.setX(((Integer) xValue).doubleValue());
                            } else if (xValue instanceof Double) {
                                node.setX((Double) xValue);
                            }
                            positionUpdated = true;
                        }
                        if (updates.containsKey("y")) {
                            Object yValue = updates.get("y");
                            if (yValue instanceof Integer) {
                                node.setY(((Integer) yValue).doubleValue());
                            } else if (yValue instanceof Double) {
                                node.setY((Double) yValue);
                            }
                            positionUpdated = true;
                        }
                        if (updates.containsKey("parentId")) {
                            node.setParentId((String) updates.get("parentId"));
                        }
                        if (updates.containsKey("expanded")) {
                            node.setExpanded((Boolean) updates.get("expanded"));
                        }
                        if (positionUpdated) {
                            node.setMoveCount(node.getMoveCount() + 1);
                        }
                        return nodeRepository.save(node);
                    })
                    .orElseThrow(() -> new RuntimeException("Node not found"));
        }
}
