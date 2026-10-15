import os
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'training_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'pricing_model.pkl')

REQUIRED_COLUMNS = [
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
    'recommendedPrice',
]


def load_data():
    data = pd.read_csv(DATA_PATH)
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in data.columns]
    if missing_cols:
        raise ValueError(f'Missing required columns: {missing_cols}')

    data = data.copy()
    data['season'] = data['season'].fillna('low')
    numeric_columns = [
        'basePrice',
        'occupancyRate',
        'numberOfBookings',
        'availableRooms',
        'totalRooms',
        'daysUntilCheckIn',
        'weekend',
        'eventImpact',
        'weatherImpact',
    ]

    for column in numeric_columns:
        data[column] = pd.to_numeric(data[column], errors='coerce')

    for column in numeric_columns:
        data[column] = data[column].fillna(data[column].median())

    data['recommendedPrice'] = pd.to_numeric(data['recommendedPrice'], errors='coerce')
    data['recommendedPrice'] = data['recommendedPrice'].fillna(data['recommendedPrice'].median())
    return data


def train_model():
    data = load_data()
    target = 'recommendedPrice'
    features = [
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
    X = data[features]
    y = data[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    numeric_features = [
        'basePrice',
        'occupancyRate',
        'numberOfBookings',
        'availableRooms',
        'totalRooms',
        'daysUntilCheckIn',
        'weekend',
        'eventImpact',
        'weatherImpact',
    ]
    categorical_features = ['season']

    preprocessor = ColumnTransformer(
        transformers=[
            ('numeric', 'passthrough', numeric_features),
            ('categorical', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        max_depth=10,
        min_samples_leaf=1,
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', model),
    ])

    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print(f'MAE: {mae:.2f}')
    print(f'RMSE: {rmse:.2f}')
    print(f'R^2: {r2:.4f}')

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f'Model saved to {MODEL_PATH}')


if __name__ == '__main__':
    train_model()
