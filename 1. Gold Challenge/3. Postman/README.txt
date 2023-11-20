Install :
Node JS 
https://nodejs.org/en

CMD : (Cek versi node & npm)
node -v
npm -v

Install Newman :
CMD : 
npm install -g newman

Buat Report Newman :

newman run <nama collection> 
Misal : 
- newman run Website_Secondhand.postman_collection.json
- newman run Website_Secondhand.postman_collection.json -e Website_Secondhand.postman_environment.json
- npm install -g newman-reporter-htmlextra
- newman run Website_Secondhand.postman_collection.json -e Website_Secondhand.postman_environment.json -r htmlextra



