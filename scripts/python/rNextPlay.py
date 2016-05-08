#!/usr/bin/env python3
import os
import random
import time
import psutil

_mp3home_dir_ = "./mp3/"
_fifo_ = "./scripts/python/fifo"
PROCNAME = "omxplayer"
procFlag = 0

def rndmp3 ():
   os.system ('echo -n "q" > fifo')
   time.sleep(0.8)
   rfile = random.choice(os.listdir(_mp3home_dir_))
   file = _mp3home_dir_ + rfile
   print ("StopNextPlay : %s" %file)
   os.system ('omxplayer -o local ' + file + ' < ' + _fifo_ + ' &')
   os.system ('echo "." > ' + _fifo_)

def normalPlay () :
   rfile = random.choice(os.listdir(_mp3home_dir_))
   file = _mp3home_dir_ + rfile
   print ("Normal Play : %s" %file)
   os.system ('omxplayer -o local ' + file + ' < ' + _fifo_ + ' &')
   os.system ('echo "." > ' + _fifo_)

def procCheck () :
   for proc in psutil.process_iter():
      if proc.name() == PROCNAME:
         return 1
      else:
         Flag = 0
   return Flag

procFlag = procCheck ()

if procFlag == 1 :
   rndmp3 ()
else :
   normalPlay ()
