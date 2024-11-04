import sqlite3
import networkx as nx
import matplotlib.pyplot as plt
import hashlib
import plotly.graph_objects as go
import re
import numpy as np


def print_graph_structure(G):
    print("Nodes in the graph:")
    for node in G.nodes():
        print(f"    {node}")

    print("\nEdges in the graph:")
    for edge in G.edges():
        print(f"    {edge[0]} -> {edge[1]}")


def create_mind_map_sqlite(keyword):
    # obtain a sha256 value of the keyword
    sha256 = hashlib.sha256()
    sha256.update(keyword.encode('utf-8'))
    sha256key = sha256.hexdigest()

    # create a graph
    G = nx.DiGraph()

    # connect to SQLite database
    conn = sqlite3.connect('mindmap.db')
    cursor = conn.cursor()

    cursor.execute(f'SELECT topic, url FROM mindmap_keyword_topic where sha256="{sha256key}"')
    rows = cursor.fetchall()

    # add the root node with "keyword" (user input)
    G.add_node(keyword)

    # add nodes and edges
    for row in rows:
        topic, url = row
        # topic = re.sub(r'^\d+\.\s*','',topic)
        # the following two lines create a core mind map
        G.add_node(topic)
        G.add_edge(keyword, topic)
        G.add_node(url)
        G.add_edge(topic, url)
    conn.commit()
    conn.close()
    return G


def create_mind_map(keyword, topics, youtube_results):
    # create a graph
    G = nx.DiGraph()
    # add the root node with "keyword" (user input)
    G.add_node(keyword)

    # add nodes and edges
    for topic in topics:
        topic = re.sub(r'^\d+\.\s*', '', topic)
        # the following two lines create a core mind map
        G.add_node(topic)
        G.add_edge(keyword, topic)

        # the following "for loop" creates a sub mind map for each topic
        for item in youtube_results:
            title = item['snippet']['title']  # Use a title if needed
            video_id = item['id']['videoId']
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            # G.add_node(video_url)
            # G.add_edge(topic, video_url)
            G.add_node(title)
            G.add_edge(topic, title)

    return G


# it receives a user keyword as the root of the mind map
def draw_mind_map_interactive(G, root):
    # Position dictionary
    pos = {}

    # Place the root node at the center
    pos[root] = np.array([0, 0])

    # Function to recursively position nodes
    def position_nodes(node, depth=1, angle_start=0, angle_end=2 * np.pi):
        neighbors = list(G.neighbors(node))
        if not neighbors:
            return

        angle_step = (angle_end - angle_start) / len(neighbors)
        radius = depth

        for i, neighbor in enumerate(neighbors):
            angle = angle_start + i * angle_step
            pos[neighbor] = np.array([radius * np.cos(angle), radius * np.sin(angle)])

            # Recursive call to position children
            position_nodes(neighbor, depth + 1, angle_start + i * angle_step, angle_start + (i + 1) * angle_step)

    # Start positioning nodes from the root
    position_nodes(root)

    # Extract positions for plotting
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])  # Add None to break lines between edges
        edge_y.extend([y0, y1, None])  # Add None to break lines between edges

    node_x = [pos[node][0] for node in G.nodes()]
    node_y = [pos[node][1] for node in G.nodes()]

    edge_trace = go.Scatter(x=edge_x, y=edge_y, mode='lines', line=dict(width=7, color='#888'))
    node_trace = go.Scatter(x=node_x, y=node_y, mode='markers+text', text=list(G.nodes()), textposition='top center',
                            marker=dict(size=50, color='#1f78b4'))

    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(title='Interactive Mind Map', showlegend=False, hovermode='closest'))

    fig.update_layout(title_text='Interactive Mind Map with Clickable Nodes')
    fig.show()




