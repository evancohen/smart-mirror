import RPi.GPIO as GPIO
import time
from threading import Timer
import subprocess
import sys



pirPin = int(sys.argv[1])
ScreenTimeOut = round(float(sys.argv[2]), 2)

GPIO.setmode(GPIO.BCM)
GPIO.setup(pirPin, GPIO.IN)
timer = False
monitor_is_on = True

def monitor_off():
  global monitor_is_on
  print "monitor off"
  subprocess.call(['/opt/vc/bin/tvservice', '-o'])
  monitor_is_on = False

def monitor_on():
  global monitor_is_on
  print "monitor on"
  subprocess.call(['/opt/vc/bin/tvservice', '-p'])
  subprocess.call(['fbset -depth 8'], shell=True)
  subprocess.call(['fbset -depth 16'], shell=True)
  subprocess.call(['xrefresh'], shell=True)
  monitor_is_on = True


while True:
  time.sleep(0.5)
  movement = GPIO.input(pirPin)
  if movement:
    if timer:
      print "cancel timer"
      timer.cancel()
      timer = False
    if not monitor_is_on:
      monitor_on()
  else:
    if not timer:
      print "start timer"
      timer = Timer(60*ScreenTimeOut, monitor_off)
      timer.start()