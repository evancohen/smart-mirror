#!/bin/bash

asoundrcFile=~/.asoundrc
if [ -f "$asoundrcFile" ]
then
	mv $asoundrcFile ${asoundrcFile/./old}_$(date +%d%m%Y-%T).txt
fi
arecout=`arecord -l | grep "card"`
aplaout=`aplay -l | grep "card"`
tempasound='pcm.!default {
  type asym
   playback.pcm {
     type plug
     slave.pcm "hw:Playback_DevID"
   }
   capture.pcm {
     type plug
     slave.pcm "hw:Capture_DevID"
   }
}'

function getCard {
	readarray -t arr_alsaOut <<<"$1"
	echo $'\n\n'
	recInd=0
	counter=1
	lowpoint=0
	echo "List of $2 Devices"
	echo ""
	for index in "${!arr_alsaOut[@]}"
	do
		if echo "${arr_alsaOut[index]}" | grep -q "card"
		then
			recDev[recInd]="${arr_alsaOut[index]}"
			echo "$[recInd]) ${recDev[recInd]}"
			let recInd=$recInd+$counter
		fi
	
	done
	echo "Enter the number of the $2 device you would like to use:  "
	read -n 1 choice
	echo ""
	if [ $choice -le $recInd ];
	then
		if [ $choice -ge $lowpoint ];
		then
			test=`echo "${recDev[choice]}" | grep -oE "[0-9]:"`
			test=`echo "$test" | tr -d '\n'`
			test=`echo "$test" | tr : ,`
			test=${test::-1}
			tempasound="${tempasound/$2_DevID/$test}"
		fi
	
	fi
}
getCard "$arecout" "Capture"
getCard "$aplaout" "Playback"
echo $'\n\n'
echo "$tempasound"
echo $'\n\n'
if [ ! -e "$asoundrcFile" ]
then
	echo "$tempasound" > "$asoundrcFile"
fi

