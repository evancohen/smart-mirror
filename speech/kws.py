import snowboydecoder
import sys
import signal

interrupted = False


def signal_handler(signal, frame):
    global interrupted
    interrupted = True


def interrupt_callback():
    global interrupted
    return interrupted

def hotword_detected_callback():
    print("!Hotword Detected")
    #snowboydecoder.play_audio_file(snowboydecoder.DETECT_DING)

if len(sys.argv) < 2:
    print("Error: need to specify model name and sensitivity")
    print("Usage: python demo.py your.model 0.5")
    sys.exit(-1)

model = sys.argv[1]
detectionSensitivity = round(float(sys.argv[2]), 2)

# capture SIGINT signal, e.g., Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

detector = snowboydecoder.HotwordDetector(model, sensitivity=detectionSensitivity)
print('Listening... Press Ctrl+C to exit')

# main loop
detector.start(detected_callback=hotword_detected_callback,
               interrupt_check=interrupt_callback,
               sleep_time=0.03)

detector.terminate()
