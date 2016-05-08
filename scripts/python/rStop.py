#!/usr/bin/env python
import os
import random

_mp3home_dir_ = "../../mp3/"
_fifo_ = "./scripts/python/fifo"

def rndmp3 ():
   os.system ('echo -n "q" > ' + _fifo_)

rndmp3 ()
