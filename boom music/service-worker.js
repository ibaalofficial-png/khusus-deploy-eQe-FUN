const CACHE_NAME = "boom-music-v1";


const filesToCache = [

"./",

"./index.html",

"./style.css",

"./app.js",

"./manifest.json",

"./cover.jpg"

];





// INSTALL

self.addEventListener(
"install",
event=>{


event.waitUntil(

caches.open(CACHE_NAME)

.then(cache=>{


return cache.addAll(filesToCache);


})


);


});







// ACTIVATE

self.addEventListener(
"activate",
event=>{


event.waitUntil(

caches.keys()
.then(keys=>{


return Promise.all(

keys.map(key=>{


if(key !== CACHE_NAME){

return caches.delete(key);

}


})


);


})


);


});








// FETCH

self.addEventListener(
"fetch",
event=>{


event.respondWith(

caches.match(event.request)

.then(response=>{


return response ||

fetch(event.request);


})


);


});