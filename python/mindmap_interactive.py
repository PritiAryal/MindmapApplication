import uuid
import json
import hashlib
import sqlite3
import re
import requests
from openai import OpenAI
from googleapiclient.discovery import build
import mindmap_drawing as md 
# 'your youtube and openai api key'
YouTube_API_KEY = ''
OPENAI_API_KEY = ''


def format_mindmap_output(title, nodes, edges):
    mindmap_data = {
        "title": title,
        "nodes": nodes,
        "edges": edges
    }
    return mindmap_data

def search_youtube(keyword, topic):
    conn = sqlite3.connect('mindmap.db')
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS mindmap_keyword_topic (
                        sha256 TEXT NOT NULL,
                        topic TEXT NOT NULL,
                        url TEXT NOT NULL,
                        UNIQUE(sha256, topic, url))
                    ''')
    sha256 = hashlib.sha256()
    sha256.update(keyword.encode('utf-8'))

    youtube = build('youtube', 'v3', developerKey=YouTube_API_KEY)

    colon_index = topic.find(':')
    if colon_index != -1:
        topic = topic[:colon_index].strip()
    query = re.sub(r'^\d+\.\s*', '', topic)

    request = youtube.search().list(
        q=query,
        part='snippet',
        type='video',
        maxResults=2
    )
    response = request.execute()

    for item in response.get('items', []):
        title = item['snippet']['title']
        video_id = item['id']['videoId']
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        cursor.execute('INSERT OR IGNORE INTO mindmap_keyword_topic (sha256, topic, url) VALUES (?, ?, ?)',
                       (sha256.hexdigest(), topic, video_url))

    conn.commit()
    conn.close()

    return response.get('items', [])

def get_relevant_topics(keyword):
    client = OpenAI(api_key=OPENAI_API_KEY)

    prompt = f"Generate a list of five essential topics related to the keyword '{keyword}' for a mind map to teach dummies. Please return only the list."
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(model="gpt-3.5-turbo",
                                              messages=messages,
                                              max_tokens=150,
                                              n=1,
                                              stop=None,
                                              temperature=0.5)
    return response.choices[0].message.content.strip().split('\n')



def main(user_id, keyword):
    topics = get_relevant_topics(keyword)
    title = keyword
    nodes = []
    edges = []

    # functions from mindmap_drawing.py
    # G = md.create_mind_map_sqlite(keyword)
    # md.draw_mind_map_interactive(G, keyword)


    root_node_id = str(uuid.uuid4())
    nodes.append({
        "id": root_node_id,
        "label": keyword,
        "parentId": None,
        "x": 0,
        "y": 0,
        "moveCount": 0,
        "videos": [],
        "expanded": True
    })


    horizontal_separation = 200
    vertical_position = -100


    for i, topic in enumerate(topics):
        node_id = str(uuid.uuid4())
        parent_id = root_node_id


        video_data = search_youtube(keyword, topic)


        videos = []
        for video in video_data:
            videos.append({
                "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}",
                "title": video["snippet"]["title"]
            })


        nodes.append({
            "id": node_id,
            "label": topic,
            "parentId": parent_id,
            "x": horizontal_separation,
            "y": (i - (len(topics) - 1) / 2) * vertical_position,
            "moveCount": 0,
            "videos": videos,
            "expanded": True
        })


        edges.append({
            "sourceId": parent_id,
            "targetId": node_id
        })

    mindmap_data = format_mindmap_output(title, nodes, edges)

    # Mindmap
    mindmap_response = requests.post(f'http://localhost:8080/mindmaps/user/{user_id}', json={'title': title})
    if mindmap_response.status_code != 201:
        print(f"Failed to create mindmap: {mindmap_response.text}")
        return

    mindmap_id = mindmap_response.json().get('id')

    # Nodes
    for node in nodes:
        node_response = requests.post(f'http://localhost:8080/mindmaps/mindmap/{mindmap_id}/node', json={
            "id": node["id"],
            "label": node["label"],
            "parentId": node["parentId"],
            "x": node["x"],
            "y": node["y"],
            "moveCount": node["moveCount"],
            "expanded": node["expanded"]
        })
        if node_response.status_code != 201:
            print(f"Failed to create node {node['label']}: {node_response.text}")

    # Edges
    for edge in edges:
        edge_response = requests.post(f'http://localhost:8080/mindmaps/edges/{edge["sourceId"]}/{edge["targetId"]}', json={})
        if edge_response.status_code != 200:
            print(f"Failed to create edge between {edge['sourceId']} and {edge['targetId']}: {edge_response.text}")

    # Videos
    for node in nodes:
        for video in node['videos']:
            video_response = requests.post(f'http://localhost:8080/mindmaps/node/{node["id"]}/video', json=video)
            if video_response.status_code != 201:
                print(f"Failed to create video for node {node['label']}: {video_response.text}")

    print("All data sent successfully to Spring Boot.")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        user_id = sys.argv[1]
        keyword = sys.argv[2]
        main(user_id, keyword)
    else:
        print("Please provide userId and a keyword for the mindmap generation.")


