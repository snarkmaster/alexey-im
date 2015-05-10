#!/usr/bin/octave -q
if (length(argv) != 3 && length(argv) != 4)
	printf "Usage: subtract-chunk.m file1.lin file2.lin difference.lin [+]"
	exit(1)
endif
a=loadaudio(argv{1},'lin',16);
b=loadaudio(argv{2},'lin',16);
if (length(argv) == 4 && argv{4} == "+") 
	c=a+b;
else
	c=a-b;
endif
if (max(c) > 32767 || min(c) <= -32768) 
	printf "Clipped a value (|original - result| not a short)."
	exit(2)
endif 
saveaudio(argv{3},a-b,'lin',16);
