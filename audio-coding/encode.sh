#!/bin/bash
if [[ "$2" == "" ]]; then
	echo "Usage: $0 file.wav quality1 quality2 ..."
	exit 1
fi
IN="`echo "$1" | sed 's/\.wav$//'`"
shift
for Q in "$@" ; do
	echo -------------- running $Q ---------------
	oggenc -q $Q $IN.wav -o $IN-q$Q.ogg
	oggdec  $IN-q$Q.ogg
	./subtract-all.sh $IN-q$Q.wav $IN.wav $IN-diffq$Q.wav
	flac $IN-diffq$Q.wav
	OGGSIZE=`wc -c $IN-q$Q.ogg | cut -f 1 -d\ `
	FLACSIZE=`wc -c $IN-diffq$Q.flac | cut -f 1 -d \ `
	echo "$Q		$OGGSIZE	$FLACSIZE	$((OGGSIZE+FLACSIZE))" >> benchmark.log
	echo "------ RESULT: $Q $OGGSIZE $FLACSIZE $((OGGSIZE+FLACSIZE)) ------"
done
