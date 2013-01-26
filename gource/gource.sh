#!/bin/sh

rm gource.log
wget http://127.0.0.1:9393/gource.log
gource --camera-mode overview \
       --file-idle-time 0 \
       --bloom-multiplier 1.2 \
       --bloom-intensity 0.4 \
       -e 0.5 \
       --background 490A3D \
       --font-size 20 \
       --font-colour EEEEEE \
       --title "Holon - Decembre 2012" \
       --hide date,filenames,mouse,progress,usernames,users \
       -1280x800 -o gource.ppm gource.log
ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i gource.ppm -vcodec libx264 -preset ultrafast -crf 1 -threads 0 -bf 0 gource.mp4
#ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i gource.ppm  -vcodec libvpx -b 10000K gource.webm
