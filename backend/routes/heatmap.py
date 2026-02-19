from flask import Blueprint, request, jsonify
from extensions import db
from models import HeatmapData
from flask_jwt_extended import jwt_required, get_jwt_identity

heatmap_bp = Blueprint('heatmap', __name__)

@heatmap_bp.route('/location', methods=['POST'])
@jwt_required()
def save_location():
    data = request.get_json()
    user_id = get_jwt_identity()
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    temperature = data.get('temperature') # Optional

    if latitude is None or longitude is None:
        return jsonify({'error': 'Missing latitude or longitude'}), 400

    new_entry = HeatmapData(
        user_id=user_id,
        latitude=latitude,
        longitude=longitude,
        temperature=temperature
    )
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({'message': 'Location saved successfully'}), 201

@heatmap_bp.route('/heatmap-data', methods=['GET'])
def get_heatmap_data():
    # Optional: Filter by bounds if needed ?lat_min=...
    data = HeatmapData.query.all()
    results = [item.to_dict() for item in data]
    return jsonify(results), 200
