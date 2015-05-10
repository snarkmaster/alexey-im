for f in *.tex; do 
	F=`echo $f | sed s/.tex//`
	latex $F && \
	latex $F && \
	dvips $F -o && \
	ps2pdf14 $F.ps $F.pdf 
done
