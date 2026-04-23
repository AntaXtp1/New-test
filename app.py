from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup
import random
import json

app = Flask(__name__, 
              template_folder='app/templates',
              static_folder='app/static')

# Mock data untuk demo (karena scraping YouTube Music/Spotify memerlukan API key)
# Ini bisa diganti dengan scraper asli jika punya API access

MOCK_ALBUMS = [
    {"id": 1, "title": "Midnight Dreams", "artist": "Luna Wave", "cover": "https://picsum.photos/300/300?random=1", "color": "#8B5CF6"},
    {"id": 2, "title": "Electric Soul", "artist": "Neon Pulse", "cover": "https://picsum.photos/300/300?random=2", "color": "#EC4899"},
    {"id": 3, "title": "Summer Vibes", "artist": "Sunset Collective", "cover": "https://picsum.photos/300/300?random=3", "color": "#F59E0B"},
    {"id": 4, "title": "Urban Nights", "artist": "City Lights", "cover": "https://picsum.photos/300/300?random=4", "color": "#10B981"},
    {"id": 5, "title": "Acoustic Sessions", "artist": "The Wanderers", "cover": "https://picsum.photos/300/300?random=5", "color": "#3B82F6"},
    {"id": 6, "title": "Bass Revolution", "artist": "Deep Frequency", "cover": "https://picsum.photos/300/300?random=6", "color": "#EF4444"},
]

MOCK_TRACKS = [
    {"id": 1, "title": "Starlight Echo", "artist": "Luna Wave", "album": "Midnight Dreams", "duration": "3:45", "cover": "https://picsum.photos/60/60?random=1"},
    {"id": 2, "title": "Neon Highway", "artist": "Neon Pulse", "album": "Electric Soul", "duration": "4:12", "cover": "https://picsum.photos/60/60?random=2"},
    {"id": 3, "title": "Golden Hour", "artist": "Sunset Collective", "album": "Summer Vibes", "duration": "3:28", "cover": "https://picsum.photos/60/60?random=3"},
    {"id": 4, "title": "Concrete Jungle", "artist": "City Lights", "album": "Urban Nights", "duration": "4:05", "cover": "https://picsum.photos/60/60?random=4"},
    {"id": 5, "title": "Mountain Road", "artist": "The Wanderers", "album": "Acoustic Sessions", "duration": "3:55", "cover": "https://picsum.photos/60/60?random=5"},
    {"id": 6, "title": "Subwoofer Test", "artist": "Deep Frequency", "album": "Bass Revolution", "duration": "4:30", "cover": "https://picsum.photos/60/60?random=6"},
    {"id": 7, "title": "Crystal Rain", "artist": "Luna Wave", "album": "Midnight Dreams", "duration": "3:22", "cover": "https://picsum.photos/60/60?random=7"},
    {"id": 8, "title": "Voltage", "artist": "Neon Pulse", "album": "Electric Soul", "duration": "3:58", "cover": "https://picsum.photos/60/60?random=8"},
]

GENRES = [
    {"name": "Pop", "color": "#EC4899", "image": "https://picsum.photos/400/200?random=10"},
    {"name": "Hip Hop", "color": "#F59E0B", "image": "https://picsum.photos/400/200?random=11"},
    {"name": "Rock", "color": "#EF4444", "image": "https://picsum.photos/400/200?random=12"},
    {"name": "Electronic", "color": "#8B5CF6", "image": "https://picsum.photos/400/200?random=13"},
    {"name": "R&B", "color": "#10B981", "image": "https://picsum.photos/400/200?random=14"},
    {"name": "Jazz", "color": "#3B82F6", "image": "https://picsum.photos/400/200?random=15"},
    {"name": "Classical", "color": "#6366F1", "image": "https://picsum.photos/400/200?random=16"},
    {"name": "Indie", "color": "#14B8A6", "image": "https://picsum.photos/400/200?random=17"},
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/albums')
def get_albums():
    return jsonify(MOCK_ALBUMS)

@app.route('/api/tracks')
def get_tracks():
    return jsonify(MOCK_TRACKS)

@app.route('/api/genres')
def get_genres():
    return jsonify(GENRES)

@app.route('/api/search')
def search():
    query = request.args.get('q', '').lower()
    results = {
        'tracks': [t for t in MOCK_TRACKS if query in t['title'].lower() or query in t['artist'].lower()],
        'albums': [a for a in MOCK_ALBUMS if query in a['title'].lower() or query in a['artist'].lower()]
    }
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
