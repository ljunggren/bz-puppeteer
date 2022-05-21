inputfiles=$(find /var/boozang/video/. -name "images.txt" | xargs -0 -I % echo %)

for input in $inputfiles
do
  last="${input%/*}"
  output="${last##*/}".webm

  echo $input
  echo $output
  ffmpeg -r 1/2 -f concat -safe 0 -i $input -r 1 $output
done
