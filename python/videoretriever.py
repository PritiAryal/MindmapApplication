from googleapiclient.discovery import build
import os
import re
import yt_dlp
import sqlite3
import threading
from pathlib import Path

# YouTube API key
api_key = ''
          # 'use your youtube API key'


# Create a service object
# youtube = build('youtube', 'v3', developerKey=api_key)

# Function to extract video ID from URL
def extract_video_id(url):
    # Regex to extract video ID from URL
    video_id_match = re.search(r'v=([^&]+)', url)
    if video_id_match:
    #     return video_id_match.group(1)
        video_id = video_id_match.group(1)
        print(f"Extracted video ID: {video_id}")  # Debug: Log the extracted video ID
        return video_id
    else:
        print(f"Failed to extract video ID from URL: {url}")
        raise ValueError("Invalid YouTube URL")


# Function to get video details
def get_video_details(video_url):
    print(f"Getting video details for URL: {video_url}")
    # Create a YouTube Data API client
    youtube = build('youtube', 'v3', developerKey=api_key)

    # Extract video ID from URL
    video_id = extract_video_id(video_url)

    # Request video details
    request = youtube.videos().list(
        part='snippet,statistics,contentDetails',
        id=video_id
    )
    response = request.execute()

    # Extract details
    video_data = response['items'][0]
    title = video_data['snippet']['title']
    length = video_data['contentDetails']['duration']
    views = video_data['statistics'].get('viewCount', 'N/A')
    likes = video_data['statistics'].get('likeCount', 'N/A')

    print(title, length, views, likes)

    minutes_match = re.search(r'(\d+)M', length)
    seconds_match = re.search(r'(\d+)S', length)

    minutes = 0
    seconds = 0

    if minutes_match:
        minutes = int(minutes_match.group(1))

    if seconds_match:
        seconds = int(seconds_match.group(1))

    total_seconds = minutes * 60 + seconds

    if total_seconds < 420 and int(likes) / int(views) > 0.05:
        return 1
    else:
        return 0


def get_channel_id(video_url):
    video_id = re.search(r'v=([a-zA-Z0-9_-]+)', video_url).group(1)
    youtube = build('youtube', 'v3', developerKey=api_key)

    # Fetch video details
    video_response = youtube.videos().list(
        part='snippet,statistics',
        id=video_id
    ).execute()

    if not video_response['items']:
        raise ValueError("Video not found or invalid URL")

    channel_id = video_response['items'][0]['snippet']['channelId']
    return channel_id


def get_channel_subscribers(channel_id):
    youtube = build('youtube', 'v3', developerKey=api_key)

    # Fetch channel details
    channel_response = youtube.channels().list(
        part='statistics',
        id=channel_id
    ).execute()

    if not channel_response['items']:
        raise ValueError("Channel not found")

    subscriber_count = channel_response['items'][0]['statistics']['subscriberCount']
    return subscriber_count


def verify_credibility(video_url):
    # video_url = 'https://www.youtube.com/watch?v=VIDEO_ID'  # Replace VIDEO_ID with the actual video ID
    try:
        channel_id = get_channel_id(video_url)
        subscribers = get_channel_subscribers(channel_id)

        if int(subscribers) > 100000:
            if get_video_details(video_url):
                print("We love this video and recommend it")
            else:
                print("We will pass this video this time")
        else:
            print(f'We will pass this channel with {subscribers} subscribers.')
    except Exception as e:
        print(f'Error: {e}')


def verify_content():
    print("create a function that check the content of the video through ChatGPT")


def download_audio(youtube_url, output_path=''):
    conn = sqlite3.connect('audio.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audiofiles (
        FilePathName TEXT UNIQUE
        );
    ''')
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_path}/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'noplaylist': True,  # don't download a playlist
        'quiet': True,  # reduce output verbosity
    }

    # create a 'yt_dlp' instance to get the filename before downloading
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(youtube_url, download=False)
        file_name = ydl.prepare_filename(info_dict)

    ##########################################################################################################
    # check if the file already exists                                                                       #
    ##########################################################################################################
    path = Path(file_name)  #
    if path.suffix.lower() == '.webm':  #
        file_name = Path(path.with_suffix('').name)  #
    file_path_name = f"{output_path}/{file_name}.mp3"  #
    print(file_path_name)  #
    if os.path.exists(file_path_name):  #
        print(f"File already exists: {file_name}")  #
        conn.commit()  #
        conn.close()  #
        return  #
    else:  #
        cursor.execute('''INSERT OR IGNORE INTO audiofiles (FilePathName) VALUES (?);''', (file_path_name,))  #
        conn.commit()  #
        conn.close()  #
    ##########################################################################################################

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
    except Exception as e:
        print(f"An error occurred: {e}")

################# TEST CODE #################
# download_audio('https://www.youtube.com/watch?v=pTB0EiLXUC8', '/home/kali/Development/audiotemp')

