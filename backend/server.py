from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import traceback
import logging

app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/api/get-info', methods=['POST'])
def get_info():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        ydl_opts = {'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({
                "title": info['title'],
                "thumbnail": info['thumbnail']
            })
    except Exception as e:
        app.logger.error(f"Error in get_info: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.json
    url = data.get('url')
    requested_quality = data.get('quality', '720')
    downloadId = data.get('downloadId')
    
    if not url or not downloadId:
        return jsonify({"error": "URL and downloadId are required"}), 400
    
    try:
        output_path = os.path.join(os.getcwd(), 'downloads')
        os.makedirs(output_path, exist_ok=True)

        ydl_opts = {
            'format': f'bestvideo[height<={requested_quality}]+bestaudio/best[height<={requested_quality}]',
            'outtmpl': os.path.join(output_path, f'{downloadId}.%(ext)s'),
            'merge_output_format': 'mp4',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            available_formats = info['formats']
            
            # Find the best matching format
            selected_format = None
            for f in available_formats:
                if f.get('height') and f['height'] <= int(requested_quality):
                    if selected_format is None or f['height'] > selected_format['height']:
                        selected_format = f

            if selected_format:
                actual_quality = selected_format['height']
                ydl_opts['format'] = f"{selected_format['format_id']}+bestaudio"
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                
                # Ensure the filename ends with .mp4
                if not filename.endswith('.mp4'):
                    new_filename = f"{os.path.splitext(filename)[0]}.mp4"
                    os.rename(filename, new_filename)
                    filename = new_filename

                return send_file(
                    filename, 
                    as_attachment=True, 
                    download_name=f"{downloadId}.mp4"
                )
            else:
                return jsonify({"error": f"No format available for quality {requested_quality}p"}), 404

    except Exception as e:
        app.logger.error(f"Error in download_video: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)