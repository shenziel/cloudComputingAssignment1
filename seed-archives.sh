#!/bin/bash
# Seed mock archive data via POST /addArchive
# Base URL: docker-compose maps worker 3001 -> host 8081
BASE_URL="http://localhost:8081"

curl -X POST "$BASE_URL/addArchive" -H 'Content-Type: application/json' -d '{"title":"DrCain","description":"The human who created the Reploids","content":"https://static.wikia.nocookie.net/megaman/images/6/61/Drcain.jpg/revision/latest/scale-to-width-down/268?cb=20181209035029"}'
echo

curl -X POST "$BASE_URL/addArchive" -H 'Content-Type: application/json' -d '{"title":"Capsule","description":"The capsule that contained X","content":"https://static.wikia.nocookie.net/megaman/images/4/4c/MMXCapsule.png/revision/latest/scale-to-width-down/153?cb=20181210222749"}'
echo

curl -X POST "$BASE_URL/addArchive" -H 'Content-Type: application/json' -d '{"title":"Sigma","description":"The leader of the Maverick hunters","content":"https://static.wikia.nocookie.net/megaman/images/e/e2/X4_SigmaGood_%28stitched%29.png/revision/latest/scale-to-width-down/180?cb=20221001170235"}'
echo

curl -X POST "$BASE_URL/addArchive" -H 'Content-Type: application/json' -d '{"title":"Thomas Light","description":"The father of Robotics","content":"https://megamanwiki.s3.us-east-va.io.cloud.ovh.us/thumb/c/c9/MHX_-_Dr._Light_Art_1.png/250px-MHX_-_Dr._Light_Art_1.png"}'
echo

curl -X POST "$BASE_URL/addArchive" -H 'Content-Type: application/json' -d '{"title":"X","description":"The robot that inspired the creation of the reploids","content":"https://static.wikia.nocookie.net/megaman/images/b/bb/MM_X_Titanium-X.png/revision/latest?cb=20130302182543"}'
echo
