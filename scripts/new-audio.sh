#!/bin/bash

asoundrcFile=~/.asoundrc
inProduction=true
if $inProduction 
then
    if [ -f "$asoundrcFile" ]; 
    then
        mv $asoundrcFile ${asoundrcFile/./old}_$(date +%d%m%Y-%T).txt
    fi
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
    recDev=()
    recMenu=()
    recInd=0
	counter=1
	step=2
	lowpoint=0

	echo ""
	for index in "${!arr_alsaOut[@]}"
	do
		if echo "${arr_alsaOut[index]}" | grep -q "card"
		then
            recInd1=$((index*2))
            recInd2=$((index*2+1))
            recDev[index]="${arr_alsaOut[index]}"
            recMenu+=("${arr_alsaOut[index]}" "")
		fi
	
	done
    #echo "recDev: ${recDev[@]}"
    #echo "recMenu: ${recMenu[@]}"
	choice=$(whiptail --title "List of $2 Devices" --menu "choose a $2 device:" 20 78 ${#recDev[@]} "${recMenu[@]}" 3>&2 2>&1 1>&3)
    #echo "choice: $choice"
			test=`echo "$choice" | grep -oE "[0-9]:"`
			test=`echo "$test" | tr -d '\n'`
			test=`echo "$test" | tr : ,`
			test=${test::-1}
			tempasound="${tempasound/$2_DevID/$test}"
}
getCard "$arecout" "Capture"
getCard "$aplaout" "Playback"
echo $'\n\n'
echo "$tempasound"
echo $'\n\n'
if $inProduction 
then
    if [ ! -e "$asoundrcFile" ]; 
    then
        echo "$tempasound" > "$asoundrcFile"
    fi
fi

