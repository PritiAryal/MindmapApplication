from openai import OpenAI
from googleapiclient.discovery import build
import mindmap_drawing as md
import re
import sqlite3
import uuid
import json
from mindmap_drawing import create_mind_map  # Uses create_mind_map function for mindmap data
from videoretriever import get_video_details  # Uses get_video_details for video data

import matplotlib.pyplot as plt
import hashlib
import webbrowser
import numpy as np

from videoretriever import download_audio

# YouTube API key
YouTube_API_KEY = ''



def search_youtube(keyword, topics):
    # connect to SQLite database
    conn = sqlite3.connect('mindmap.db')
    cursor = conn.cursor()

    # create a database that keeps the sha256 value of the given keyword and related topics
    cursor.execute('''CREATE TABLE IF NOT EXISTS mindmap_keyword_topic (
                   sha256 TEXT NOT NULL,
                   topic TEXT NOT NULL,
                   url TEXT NOT NULL,
                   UNIQUE(sha256, topic, url))
                   ''')

    # create a new SHA-256 hash object
    sha256 = hashlib.sha256()
    sha256.update(keyword.encode('utf-8'))

    # we may want to add the lines to access database instead of calling this function directly
    youtube = build('youtube', 'v3', developerKey=YouTube_API_KEY)

    for topic in topics:
        colon_index = topic.find(':')
        if colon_index != -1:
            topic = topic[
                    :colon_index].strip()  # remove additional information returned from ChatGPT regarding the topics
            # remove additional information after ':'
        query = re.sub(r'^\d+\.\s*', '', topic)  # remove numbering

        request = youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            maxResults=2
        )
        response = request.execute()

        for item in response.get('items', []):
            title = item['snippet']['title']  # Use a title if needed
            video_id = item['id']['videoId']
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            cursor.execute('INSERT OR IGNORE INTO mindmap_keyword_topic (sha256, topic, url) VALUES (?, ?, ?)',
                           (sha256.hexdigest(), query, video_url))  # this is for future use.

    conn.commit()
    conn.close()

    return response.get('items', [])


def get_relevant_topics(keyword):
    # OpenAI API key
    client = OpenAI(
        api_key='', )


    # prompt=f"Generate a list of seven essential topics related to the keyword '{keyword}' in one or two words for a mind map to teach dummies."
    prompt = f"Generate a list of three essential topics related to the keyword '{keyword}' for a mind map to teach dummies. Please return only the list."
    messages = [{"role": "user", "content": prompt}]
  
    response = client.chat.completions.create(model="gpt-3.5-turbo",
                                              messages=messages,
                                              max_tokens=150,
                                              n=1,
                                              stop=None,
                                              temperature=0.5)

    # store the relevant topics
    return response.choices[0].message.content.strip().split('\n')


def main():
    while True:
        keyword = input("Enter a keyword for the mind map (type 'exit' to end your search): ")

        if keyword.lower() == 'exit':
            print("Exiting the search.")
            break
        topics = get_relevant_topics(keyword)
        youtube_results = search_youtube(keyword, topics)

        if topics:
            # functions from mindmap_drawing.py
            G = md.create_mind_map_sqlite(keyword)
            md.draw_mind_map_interactive(G, keyword)
        else:
            print("No topics found for the given keyword.")

        download_audio('https://www.youtube.com/watch?v=LSEYdU8Dp9Y','')

if __name__ == "__main__":
    main()
