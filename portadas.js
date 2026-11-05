// Solo se descarga el coche elegido; la portada se mantiene estable durante la visita.
const PORTADAS = [
 {id:5,name:'Volkswagen Tera azul',base:'assets/portadas/tera',large:true},
 {id:9,name:'CUPRA León VZ gris Taiga',base:'assets/portadas/leon',large:true},
 {id:2,name:'Volkswagen Polo blanco',base:'assets/portadas/polo',large:true},
 {id:4,name:'Volkswagen Taos verde',base:'assets/portadas/taos',large:true},
 {id:6,name:'Volkswagen Tiguan gris',base:'assets/portadas/tiguan',large:true}
];
(function(){
 const active=PORTADAS.filter(p=>INVENTARIO.some(c=>c.id===p.id));
 const image=document.querySelector('.editorial-car');if(!image||!active.length)return;
 let previous;try{previous=Number(sessionStorage.getItem('ac-previous-hero'))}catch{}
 const options=active.length>1?active.filter(p=>p.id!==previous):active;
 const chosen=options[Math.floor(Math.random()*options.length)];
 try{sessionStorage.setItem('ac-previous-hero',String(chosen.id))}catch{}
 image.addEventListener('load',()=>image.classList.add('ready'),{once:true});
 image.addEventListener('error',()=>{image.removeAttribute('srcset');image.src='assets/autos/'+String(chosen.id).padStart(2,'0')+'-1.webp';image.classList.add('ready')},{once:true});
 image.alt=chosen.name+' · seminuevo';image.sizes='(max-width:650px) 92vw, 53vw';
 image.srcset=chosen.base+'-mobile.webp 960w, '+chosen.base+'.webp 1920w'+(chosen.large?', '+chosen.base+'-4k.webp 3840w':'');image.src=chosen.base+'.webp';
 if(image.complete&&image.naturalWidth)image.classList.add('ready');
})();
