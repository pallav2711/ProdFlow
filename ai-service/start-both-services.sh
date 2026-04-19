#!/bin/bash
# Start both AI services together

# Start Sprint Prediction Service in background
echo "Starting AI Sprint Prediction Service on port 8000..."
python main.py &

# Wait a moment
sleep 2

# Start Performance Analysis Service in foreground
echo "Starting AI Performance Analysis Service on port 8001..."
python performance_api.py
