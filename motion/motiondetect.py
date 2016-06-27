import RPi.GPIO as GPIO
import time
from threading import Timer
import subprocess
import sys
import signal

isDebug = True
interrupted = False


def signal_handler(signal, frame):
    global interrupted
    interrupted = True
    exit(0)
if len(sys.argv) < 2:
  motionPin = 26
  ScreenTimeOut = float(0.5)
  
else:
  motionPin = int(sys.argv[1])
  ScreenTimeOut = round(float(sys.argv[2]), 2)

print motionPin
print ScreenTimeOut

def debugging(msg):
  global isDebug
  if isDebug:
    print msg


GPIO.setmode(GPIO.BCM)
GPIO.setup(motionPin, GPIO.IN)
timer = False
monitor_is_on = True

def monitor_off():
  global monitor_is_on
  debugging("monitor off")
  subprocess.call('sudo /opt/vc/bin/tvservice -o', shell=True)
  monitor_is_on = False

def monitor_on():
  global monitor_is_on
  debugging("monitor on")
  subprocess.call('sudo /opt/vc/bin/tvservice -p && sudo fbset -depth 8 && sudo fbset -depth 16 && sudo xrefresh -d :0.0', shell=True)
  monitor_is_on = True

signal.signal(signal.SIGINT, signal_handler)

while True:
  debugging("Waiting for movement")
  time.sleep(0.5)
  movement = GPIO.input(motionPin)
  if movement:
    debugging("  movement active")
    if timer:
      debugging("    cancel timer")
      timer.cancel()
      timer = False
    if not monitor_is_on:
      debugging("    calling monitor on")
      monitor_on()
  else:
    debugging("  movement inactive")
    if not timer:
      debugging("    starting timer")
      timer = Timer(60*ScreenTimeOut, monitor_off)
      timer.start()
