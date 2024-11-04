package com.example.MindmapBackend.Domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Node {
    @Id

    private String id = UUID.randomUUID().toString();
    private String label;

    private String parentId = UUID.randomUUID().toString();
    private double x;
    private double y;
    private int moveCount = 0;

//    @JsonIgnore
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "mindmap_id", nullable = false)
//    private Mindmap mindmap;

    @JsonIgnore
    @ManyToMany(mappedBy = "nodes")
    private List<Mindmap> mindmaps = new ArrayList<>();


//    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonIgnore
//    private List<NodeInstance> nodeInstances = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "node_parents",
            joinColumns = @JoinColumn(name = "child_node_id"),
            inverseJoinColumns = @JoinColumn(name = "parent_node_id")
    )
    @JsonIgnore
    private List<Node> parents = new ArrayList<>();


    @OneToMany(mappedBy = "parentId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Node> children = new ArrayList<>();

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Video> videos = new ArrayList<>();

    private boolean expanded;
    @OneToMany(mappedBy = "source", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Edge> outgoingEdges = new ArrayList<>();;

    @OneToMany(mappedBy = "target", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Edge> incomingEdges = new ArrayList<>();;
}
