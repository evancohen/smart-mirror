#!/usr/bin/env python
import os
import random

_mp3home_dir_ = "./mp3/"
_fifo_ = "./scripts/python/fifo"
def rndmp3 ():
   rfile = random.choice(os.listdir(_mp3home_dir_))
   file = _mp3home_dir_ + rfile
   print "%s" % file
   os.system ('omxplayer -o local ' + file + ' < ' + _fifo_ + ' &')
   os.system ('echo "." > ' + _fifo_)

rndmp3 ()
