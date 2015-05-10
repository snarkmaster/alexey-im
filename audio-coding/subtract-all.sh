#!/bin/bash
if [[ "$3" == "" ]]; then
	echo "Usage: $0 file1.wav file2.wav output.wav [+]"
	exit 1
fi
head -c 44 "$1" > "$3"
if ! head -c 44 "$2" | diff -q "$3" - ; then 
	echo "File headers must be the same."
	exit 3
fi
SIZE=`wc -c $1 | cut -f 1 -d \ `
SIZE2=`wc -c $2 | cut -f 1 -d \ `
if [[ $SIZE != $SIZE2 ]]; then
	echo "File sizes must be the same ($SIZE1 != $SIZE2)."
	exit 2
fi
DIR="`dirname "$0"`"
BLOCKSIZE=2000000

TMP1=`mktemp ./tmp1-$$-XXXXXXXXX`
TMP2=`mktemp ./tmp2-$$-XXXXXXXXX`
TMP3=`mktemp ./tmp3-$$-XXXXXXXXX`
mv $TMP1 $TMP1.lin
mv $TMP2 $TMP2.lin
mv $TMP3 $TMP3.lin

for ((i=45;i<=SIZE;i+=BLOCKSIZE)); do
	tail -c +$i "$1" | head -c $BLOCKSIZE > $TMP1.lin
	tail -c +$i "$2" | head -c $BLOCKSIZE > $TMP2.lin
	"$DIR"/subtract-chunk.m $TMP1 $TMP2 $TMP3 "$4" || exit 1
	cat $TMP3.lin >> "$3" 
done

rm $TMP1.lin $TMP2.lin $TMP3.lin
