#!/usr/bin/env python
 
from __future__ import with_statement
from PIL import Image
 
im = Image.open('data/2.jpeg') #relative path to file
 
#load the pixel info
pix = im.load()
 
#get a tuple of the x and y dimensions of the image
width, height = im.size
 
#open a file to write the pixel data
# with open('output_file.csv', 'w+') as f:
 
#   #read the details of each pixel and write them to the file
#   for x in range(width):
#     for y in range(height):
#       r = pix[x,y][0]
#       g = pix[x,x][1]
#       b = pix[x,x][2]
#       f.write('{0},{1},{2}\n'.format(r,g,b))
    
with open('output_file.csv', 'w+') as f:  
    rawData = im.load()
    data = []
    for y in range(28):
        for x in range(28):
            data.append(str(abs(rawData[x,y][0]-255)))
    out = ','.join(data)
    print out
    f.write(out)