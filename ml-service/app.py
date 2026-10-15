import os
from flask import Flask, jsonify, request
from flask_cors import CORS

from predict import predict_price

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}})

REQUIRED_FIELDS = [
    'basePrice',
    'occupancyRate',
    'numberOfBookings',
    'availableRooms',
    'totalRooms',
    'daysUntilCheckIn',
    'season',
    'weekend',
    'eventImpact',
    'weatherImpact',
]


@app.get('/health')
def health():
    return jsonify({
        'success': True,
        'message': 'ML pricing service is running',
    })


@app.post('/predict-price')
def predict_price_route():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            'success': False,
            'message': 'Request body must be a JSON object',
        }), 400

    missing = [field for field in REQUIRED_FIELDS if field not in payload]
    if missing:
        return jsonify({
            'success': False,
            'message': f'Missing required fields: {", ".join(missing)}',
        }), 400

    try:
        recommended_price = predict_price(payload)
        base_price = float(payload['basePrice'])
        price_change = round(recommended_price - base_price, 2)
        price_change_percentage = round((price_change / base_price) * 100, 2) if base_price else 0.0

        return jsonify({
            'success': True,
            'basePrice': round(base_price, 2),
            'recommendedPrice': round(recommended_price, 2),
            'priceChange': round(price_change, 2),
            'priceChangePercentage': round(price_change_percentage, 2),
        })
    except ValueError as exc:
        return jsonify({
            'success': False,
            'message': str(exc),
        }), 400
    except FileNotFoundError as exc:
        return jsonify({
            'success': False,
            'message': str(exc),
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
