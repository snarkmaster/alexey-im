#!/bin/bash
if [[ "$3" == "" ]]; then
	echo "Usage: $0 file1.ogg file2.flac output.wav"
	exit 1
fi
IN1="`echo "$1" | sed 's/\.ogg$/.wav/'`"
IN2="`echo "$2" | sed 's/\.flac$/.wav/'`"
oggdec "$1"
flac -d "$2"
./subtract-all.sh $IN1 $IN2 "$3" + 
rm "$IN1" "$IN2"
