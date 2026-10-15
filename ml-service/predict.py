import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'pricing_model.pkl')

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


def validate_payload(payload):
    if not isinstance(payload, dict):
        raise ValueError('Prediction payload must be a JSON object.')

    missing = [field for field in REQUIRED_FIELDS if field not in payload]
    if missing:
        raise ValueError(f'Missing required fields: {", ".join(missing)}')

    base_price = float(payload['basePrice'])
    occupancy_rate = float(payload['occupancyRate'])
    available_rooms = float(payload['availableRooms'])
    total_rooms = float(payload['totalRooms'])
    days_until_check_in = float(payload['daysUntilCheckIn'])
    weekend = int(payload['weekend'])
    event_impact = float(payload['eventImpact'])
    weather_impact = float(payload['weatherImpact'])

    if base_price <= 0:
        raise ValueError('basePrice must be greater than 0')
    if not 0 <= occupancy_rate <= 1:
        raise ValueError('occupancyRate must be between 0 and 1')
    if available_rooms < 0:
        raise ValueError('availableRooms must be greater than or equal to 0')
    if total_rooms <= 0:
        raise ValueError('totalRooms must be greater than 0')
    if days_until_check_in < 0:
        raise ValueError('daysUntilCheckIn must be greater than or equal to 0')
    if weekend not in (0, 1):
        raise ValueError('weekend must be 0 or 1')
    if not 0 <= event_impact <= 1:
        raise ValueError('eventImpact must be between 0 and 1')
    if not 0 <= weather_impact <= 1:
        raise ValueError('weatherImpact must be between 0 and 1')

    return {
        'basePrice': base_price,
        'occupancyRate': occupancy_rate,
        'numberOfBookings': float(payload['numberOfBookings']),
        'availableRooms': available_rooms,
        'totalRooms': total_rooms,
        'daysUntilCheckIn': days_until_check_in,
        'season': str(payload['season']).strip() or 'low',
        'weekend': weekend,
        'eventImpact': event_impact,
        'weatherImpact': weather_impact,
    }


def predict_price(payload):
    validated = validate_payload(payload)

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError('Model file not found. Train the model first using train_model.py.')

    pipeline = joblib.load(MODEL_PATH)
    feature_frame = pd.DataFrame([validated])
    prediction = pipeline.predict(feature_frame)
    recommended_price = float(prediction[0])

    if recommended_price < 0:
        recommended_price = 0.0

    return round(recommended_price, 2)
