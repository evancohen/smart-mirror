import RPi.GPIO as GPIO
import time
from threading import Timer
import subprocess
import sys
import signal
import os
import logging

logging.basicConfig()
logger = logging.getLogger("motionDetect")
logger.setLevel(logging.INFO)

interrupted = False

if len(sys.argv) < 2:
  motionPin = 26
  isDebug = True
else:
  motionPin = int(sys.argv[1])
  isDebug = True if sys.argv[2] == 'true' else False


def debugging(msg):
  global isDebug
  if isDebug:
    logger.debug(msg)


GPIO.setmode(GPIO.BCM)
GPIO.setup(motionPin, GPIO.IN)


def monitor_off():
  global monitor_is_on
  debugging("monitor off")
  subprocess.Popen('tvservice -o', shell=True)
  monitor_is_on = False

def monitor_on():
  global monitor_is_on
  debugging("monitor on")
  subprocess.Popen('tvservice -p', shell=True)
  subprocess.Popen('fbset -depth 8 && fbset -depth 16 && xrefresh', shell=True)
  monitor_is_on = True


while True:
  debugging("Waiting for movement")
  time.sleep(0.5)
  movement = GPIO.input(motionPin)
  if movement:
    debugging("  movement active")
	logger.info("Movement Active")
    if timer:
      debugging("    cancel timer")
      timer.cancel()
      timer = False
    if not monitor_is_on:
      debugging("    calling monitor on")
      monitor_on()
  else:
    debugging("  movement inactive")
	logger.info("Movement Inactive")
    if not timer:
      debugging("    starting timer")
      timer = Timer(60*ScreenTimeOut, monitor_off)
      timer.start()
