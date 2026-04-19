"""
Unified Startup Script for Both AI Services
Starts Sprint Prediction Service (port 8000) and Performance Analysis Service (port 8001)
"""
import subprocess
import sys
import time
import os

def start_services():
    """Start both AI services"""
    print("=" * 80)
    print("🚀 Starting ProdFlow AI Services")
    print("=" * 80)
    print()
    
    # Start Sprint Prediction Service (port 8000)
    print("📊 Starting AI Sprint Prediction Service on port 8000...")
    sprint_process = subprocess.Popen(
        [sys.executable, "main.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True
    )
    
    # Wait a moment for first service to start
    time.sleep(2)
    
    # Start Performance Analysis Service (port 8001)
    print("📈 Starting AI Performance Analysis Service on port 8001...")
    performance_process = subprocess.Popen(
        [sys.executable, "performance_api.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True
    )
    
    print()
    print("=" * 80)
    print("✅ Both AI Services Started Successfully!")
    print("=" * 80)
    print()
    print("Services running at:")
    print(f"  - Sprint Prediction:    http://0.0.0.0:8000")
    print(f"  - Performance Analysis: http://0.0.0.0:8001")
    print()
    print("Press Ctrl+C to stop both services")
    print("=" * 80)
    
    try:
        # Keep both processes running
        sprint_process.wait()
        performance_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping services...")
        sprint_process.terminate()
        performance_process.terminate()
        sprint_process.wait()
        performance_process.wait()
        print("✅ Services stopped")

if __name__ == "__main__":
    start_services()
