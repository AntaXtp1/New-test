from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from ytmusicapi import YTMusic
import yt_dlp
from typing import Optional, List, Dict, Any
import uvicorn

app = FastAPI(title="Spotify/YT Music Clone API")

# Initialize YTMusic (unauthenticated for public data)
ytmusic = YTMusic()

# Store for caching stream URLs (in production, use Redis)
stream_cache: Dict[str, str] = {}


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main web interface"""
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=50)):
    """Search for songs, albums, artists, and playlists"""
    try:
        results = ytmusic.search(query=q, limit=limit)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/home")
async def home():
    """Get home feed with recommendations"""
    try:
        home_data = ytmusic.get_home(limit=6)
        return {"success": True, "data": home_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/song/{song_id}")
async def get_song(song_id: str):
    """Get detailed information about a song"""
    try:
        # Get watch playlist which contains song details
        playlist = ytmusic.get_watch_playlist(song_id)
        return {"success": True, "data": playlist}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/album/{album_id}")
async def get_album(album_id: str):
    """Get album details"""
    try:
        album_data = ytmusic.get_album(album_id)
        return {"success": True, "data": album_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/artist/{artist_id}")
async def get_artist(artist_id: str):
    """Get artist details and songs"""
    try:
        artist_data = ytmusic.get_artist(artist_id)
        return {"success": True, "data": artist_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/playlist/{playlist_id}")
async def get_playlist(playlist_id: str):
    """Get playlist details"""
    try:
        playlist_data = ytmusic.get_playlist(playlist_id)
        return {"success": True, "data": playlist_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stream/{video_id}")
async def get_stream_url(video_id: str):
    """Get audio stream URL for a video"""
    try:
        # Check cache first
        if video_id in stream_cache:
            return {"success": True, "url": stream_cache[video_id], "cached": True}
        
        # Use yt-dlp to extract audio stream URL
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            if not info or 'url' not in info:
                raise HTTPException(status_code=404, detail="Stream URL not found")
            
            stream_url = info['url']
            # Cache the URL
            stream_cache[video_id] = stream_url
            
            return {
                "success": True, 
                "url": stream_url, 
                "cached": False,
                "title": info.get('title', 'Unknown'),
                "duration": info.get('duration', 0),
                "thumbnail": info.get('thumbnail', '')
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stream: {str(e)}")


@app.get("/api/lyrics/{browse_id}")
async def get_lyrics(browse_id: str):
    """Get lyrics for a song (if available)"""
    try:
        if not browse_id:
            return {"success": False, "data": None}
        
        lyrics = ytmusic.get_lyrics(browse_id)
        return {"success": True, "data": lyrics}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
