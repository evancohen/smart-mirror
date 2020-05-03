h1>Motion Detection configuration</h1>

 <p>Smart-Mirror supports 2 approaches to motion detection 

 <ul>
<li>Hardware PIR sensor wired to Raspberry PI</li>
<li>Externally provided sensor of some kind
<p>this could be via a webcam or some other mechanism</p>
</li>
</ul>
<p>to enable motion detection, you must first enable the autosleep function.
othewise smart-mirror will never go to sleep at all

 <p>once autosleep is enabled (pick TV or Monitor, depending on what kind of display you are using for smart-mirror)
then select either PIN or External mode in the Motion, Mode dropdown

 <p>once you select external motion, smart-mirror will start looking for the files that indicate motion is occurring 

 <p>the <b>external-motion</b> script in the scripts folder can be used to provide the proper file names and location to support the built in detection code. 

 <p>an Example of an external motion detection provider is the github Motion project at <a href="https://motion-project.github.io/">https://motion-project.github.io/</a>

 as part of the Motion project configuration, you can have it signal 
<ul>
<li>motion start</li>
<li>how long to wait from last motion detection (gap)</li>
<li>motion ended</li>
</ul>

 <p>to enable motion detection, modify the <b>/etc/motion/motion.conf</b> file, and set these lines 
<ul>
<li>on_event_start /home/pi/smart-mirror/scripts/external-motion started</li>
<li>on_event_end /home/pi/smart-mirror/scripts/external-motion ended</li>
<li>event_gap n
<p>where n is the number of seconds since the last motion was detected until signalling motion end
<p> for example, if you had event_gap 15, this would mean wait 15 seconds since the last motion, and then signal event_ended.
<p>but if there was motion again in 14 seconds then it would wait ANOTHER 15 seconds from then, before signaling event end..
this helps detect continupus motion.. 
<p>see the help from the Motion tool for more configuration options.

 </li>
<p>Note: smart-mirror currently does not have any processing when motion ended is detected, but this event is reported. 
this could change in the future
</ul>
