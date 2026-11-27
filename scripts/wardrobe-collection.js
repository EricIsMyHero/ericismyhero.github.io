(function () {
  'use strict';

  const path = (d, fill, stroke = 'none', width = 2) =>
    '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round"/>';
  const rect = (x, y, w, h, radius, fill, stroke = 'none', width = 2) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + radius + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  const circle = (x, y, r, fill, stroke = 'none', width = 2) =>
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  const ink = '#203047';
  const cream = '#fff1d0';
  const gold = '#ffd17a';
  const aqua = '#77efde';
  const rose = '#ff9fae';
  const stars = (x, y, color) => path('M'+x+' '+(y-4)+'v8m-4-4h8', 'none', color);
  const mug = (x, y, color) => '<g transform="translate('+x+' '+y+')">'+
    path('M15 4q9-3 8 3t-8 5M7-3q-2-3 1-6m6 5q-2-3 1-6', 'none', cream)+
    rect(0,0,17,15,4,color,ink)+path('M4 6h9','none',cream)+'</g>';
  const faceEyes = (r = 5) => circle(47,63,r,ink)+circle(78,63,r,ink)+circle(46,61,1.3,'white')+circle(77,61,1.3,'white');
  const campus = path('M11 115V55h13V44l40-20 40 20v11h13v60z','#37516f')+
    path('M23 99V61m14 38V61m14 38V61m26 38V61m14 38V61m14 38V61M13 112h102M20 53h88','none','#8cafcf',4);
  const monitor = rect(39,96,50,30,4,'#293f61',ink)+rect(43,100,42,21,3,'#244958')+
    path('m57 105-5 5 5 5m14-10 5 5-5 5m-4-12-6 14m-20 12h49','none',aqua);
  const ribbonFrame = (color) => rect(5,6,118,132,24,'none',color,3);
  const sheets = (x,y,r) => '<g transform="translate('+x+' '+y+') rotate('+r+')">'+
    rect(0,0,12,16,2,'#ecd9ad')+path('M3 5h6m-6 3h6m-6 3h4','none','#837291',1)+'</g>';

  window.UNECWardrobeCollection = {
    head: [
      ['sunhat','Xəzər panaması','Caspian bucket hat',75,path('M19 47q21-11 90 0l-7 9H25zM37 44l4-22h41l11 22z','#dfc58e',ink)+path('M39 36h49','none','#577c7b',5)],
      ['aviator','Pilot papağı','Aviator cap',130,path('M19 66V46q5-31 43-31 35 0 44 31v20h-14V48H34v18z','#a16154',ink)+rect(42,25,41,16,6,'#748da9',cream)+path('M63 26v14','none',cream)],
      ['antenna','Kampus antenası','Campus antenna',155,path('M64 29 78 12l10-2','none',aqua,4)+circle(91,9,6,rose,ink)+path('M32 44q31-20 63 0','none','#e1a8fb',5)],
      ['laurel','Zeytun çələngi','Olive wreath',235,path('M21 60q-1-37 39-41m46 41q1-37-39-41','none','#aae9aa',4)+path('m32 38-13-5 4 12zm9-11-9-8-4 12zm55 11 13-5-4 12zm-9-11 9-8 4 12z','#ebecae')],
      ['mooncap','Ay işığı papağı','Moonlight cap',325,path('M19 51q14-6 21-42l26 13 23-6 7 40z','#505083',ink)+path('M97 12a13 13 0 1 0 12 17A12 12 0 0 1 97 12z',gold)+stars(83,39,cream)]
    ],
    outfit: [
      ['denim','Cins gödəkçə','Denim jacket',50,['#4776a1','#6c9abf',path('M63 94v33m-20-23h13v6H43zm28 0h11v6H71z','none','#b4d3e4')]],
      ['kimono','Kampus kimonosu','Campus kimono',90,['#ba80a8','#dfa4c8',path('m49 92 31 21m-1-21-31 21m-8 4h46','none','#ffe2a0',5)]],
      ['debater','Debat klubu jileti','Debate club waistcoat',115,['#435868','#eedce2',path('m49 93 13 14 14-14m-14 14v19','none',cream)+circle(70,113,2,gold)+circle(70,121,2,gold)]],
      ['sailor','Xəzər matrosu','Caspian sailor',145,['#e4edf0','#376589',path('m44 94 18 17 18-17m-28 12h20m-14 20 5-12 5 12','#e87a73','#385679')]],
      ['astronaut','Tələbə astronavtı','Student astronaut',380,['#f2dcc4','#d1d7e2',rect(48,103,29,17,4,'#658ca1',ink)+circle(54,109,2,aqua)+circle(62,109,2,rose)+path('M52 117h21','none',cream)]],
      ['checker','Şahmat sviteri','Chess sweater',95,['#765384','#453956',path('M46 100h10v10H46zm10 10h10v10H56zm10-10h10v10H66zm10 10h9v10h-9zm-30 10h10v7H46zm20 0h10v7H66z','#f2d9a7')]],
      ['festival','Bahar festivalı','Spring festival suit',200,['#487b68','#e6a272',path('m42 118 40-21v12l-39 17z','#ffd08a')+stars(54,105,'#fcdd85')+stars(72,119,'#fcdd85')]],
      ['tailcoat','Açılış frakı','Opening-night tailcoat',285,['#5c355b','#b98eaa',path('m49 94 14 12 14-12-8 33H57z','#f4d3dc')+path('m54 103 9 4 9-4v8l-9-4-9 4z','#742c59')]],
      ['courier','Kampus kuryeri','Campus courier',165,['#826446','#b99865',path('m78 93-28 33','none',cream,5)+rect(42,111,18,15,4,'#d3aa68',ink)+circle(51,115,2,gold)]],
      ['commission','Komissiya mundiri','Commission uniform',500,['#422c57','#ae82c4',path('M43 98h39m-40 4h41m-21 5v19','none',gold,3)+path('m62 106 7 5-7 6-7-6z',aqua)+stars(77,122,gold)]]
    ],
    accessory: [
      ['umbrella','Xəzər çətiri','Caspian umbrella',90,path('M81 96q16-26 42 0-5-4-10 0-6-4-11 0-6-4-11 0-5-4-10 0z','#7c70ba',ink)+path('M102 96v22q0 6-5 5','none',cream,3)],
      ['brush','Rəssam fırçası','Artist brush',65,path('m95 121 12-22 3 2-12 23z','#e6ae73',ink)+path('m105 99 3-9 8-2-2 11-5 4z',rose,ink)],
      ['microphone','Debat mikrofonu','Debate microphone',125,rect(100,101,8,20,3,'#60758d',ink)+circle(104,98,7,'#d1e0eb',ink)+path('M98 98h12','none','#9aabc6')],
      ['calculator','Maliyyə kalkulyatoru','Finance calculator',150,rect(91,92,24,31,4,'#607c91',ink)+rect(95,96,16,7,1,aqua)+path('M96 108h14m-14 5h14m-14 5h14m-10-11v12m6-12v12','none',cream,1.2)],
      ['keycard','Kampus giriş kartı','Campus keycard',230,path('m89 104 12-15 9 10','none',aqua,3)+rect(91,101,25,18,4,'#6e61af',cream)+circle(98,110,3,rose)+path('M104 108h8m-8 4h6','none',cream,1.6)]
    ],
    mood: [
      ['sleepless','Yuxusuz gözaltı halqaları','Sleepless eyes',50,faceEyes()+path('M39 69q9 6 16 0m16 0q8 6 16 0m-29 10h11','none','#996992',3)],
      ['smug','Əlaçı təbəssümü','Honors smirk',80,faceEyes()+path('M41 55l12-3m18 2 13 2m-27 21q11 5 18-5','none',ink,2.7)],
      ['panic','Panikada imtahan baxışı','Exam panic',110,circle(47,63,10,'#fff7e1')+circle(78,63,10,'#fff7e1')+faceEyes(3)+circle(64,78,5,'#96556c')+path('m90 61 6 9-2 3-5-2z','#83d9fb')],
      ['cool','Cool eynəkli baxış','Cool shades',145,path('M35 57h24l-3 12H38zm33 0h24l-3 12H70zM58 60h11','none',ink,3)+path('M36 59h20l-2 7H39zm34 0h19l-2 7H72z','#315c71')+path('m42 61 7-1m26 1 7-1m-21 15q8 4 13-3','none',aqua,2)],
      ['wink','Ulduzlu göz qırpımı','Starlit wink',120,circle(77,63,6,ink)+stars(78,61,gold)+path('M37 64q9-8 17 0m2 12q7 9 16-2','none',ink,3)],
      ['thinking','Dərin düşüncə','Deep thought',90,faceEyes()+path('m39 55 15-1m19-4 12 7m-26 23 11-3','none',ink,2.5)+circle(91,52,2,cream)],
      ['triumph','Zəfər sevinci','Victory grin',185,path('M39 64q8-12 16 0m15 0q8-12 16 0','none',ink,3)+path('M52 73h24q-2 13-12 13t-12-13z','#995168')+path('M55 74h18','none',cream,3)]
    ],
    backdrop: [
      ['campus','UNEC korpusu silueti','UNEC campus silhouette',90,campus+circle(102,25,10,gold)],
      ['exam-papers','Uçuşan imtahan vərəqləri','Flying exam sheets',120,sheets(18,24,-24)+sheets(102,18,18)+sheets(103,79,-25)+sheets(14,81,12)],
      ['code-rain','Lazer kod matrisi','Laser code matrix',235,path('M13 21h32v7H27v12H13zm81 6h16v12H98v20H85zm2 48h18v30H96zm-83 8h14v10h-8v19h-6z','#358a85')+path('M17 52v19m13-20v8m75-7v12m8-42v9m-95 94h88','none',aqua,2)],
      ['stipend','Qızıl təqaüd parıltısı','Golden scholarship halo',325,circle(64,69,42,'none',gold,7)+circle(64,69,51,'none','#eea455',2)+stars(25,35,cream)+stars(104,43,gold)+stars(110,94,gold)],
      ['rainy-baku','Yağışlı Bakı axşamı','Rainy Baku evening',190,path('M9 115V72h13l7-39 10 15v26l10 2 8-57 14 31 2 30 12-2 11-40 12 20v35h11v22z','#5d658a')+path('m18 25-6 13m16 10-7 14m92-43-7 13m8 27-6 14m8 12-7 14m-91-15-6 14','none','#96c8ed')],
      ['caspian','Xəzərdə səhər','Caspian sunrise',135,circle(87,33,20,'#ffb77a')+path('M8 76q13-8 28 0t28 0 28 0 28 0v38H8z','#31848f')+path('M13 91q12-8 26 0t26 0 26 0 26 0M13 104q12-8 26 0t26 0 26 0 26 0','none','#83cbd1')],
      ['observatory','Kampus rəsədxanası','Campus observatory',420,circle(95,33,17,'#e6bcf0')+circle(103,28,16,'#54436c')+path('M14 119V86q10-21 35-19l23-37 7 5-17 39q11 8 14 16v29z','#544d82')+stars(20,29,aqua)+stars(105,70,cream)+stars(21,68,gold)]
    ],
    pet: [
      ['mini-cup','Mini kofe fincanı','Mini coffee cup',65,mug(12,86,'#b75c50')+circle(17,94,1.6,ink)+circle(24,94,1.6,ink)],
      ['owl','Kiçik bayquş','Little owl',145,path('m10 86 2-9 8 5 8-5 4 9v13q-9 11-22 0z','#9f7583',ink)+circle(16,89,4,cream)+circle(25,89,4,cream)+circle(16,89,1.7,ink)+circle(25,89,1.7,ink)+path('m18 94 6 0-3 5z',gold)],
      ['router','Wi-Fi router dronu','Wi-Fi router drone',185,rect(8,89,25,12,4,'#5c94a7',ink)+path('M12 88v-6m15 6v-6m-12 2q5-6 10 0m-7 2q2-3 4 0','none',aqua)+circle(26,95,2,rose)],
      ['retake','KƏSR kabuscuğu','Retake ghost',240,path('M7 104V89q2-12 14-12t14 12v15l-7-4-7 5-7-5z','#b3a0ea',ink)+circle(16,89,2,ink)+circle(25,89,2,ink)+path('M16 95q5 4 10 0','none','#655084')],
      ['fox','Kampus tülküsü','Campus fox',270,path('m7 99 3-19 11 7 10-7 3 19-13 8z','#ef9a67',ink)+path('m10 96 11 5 11-5-11 10z',cream)+circle(16,94,1.5,ink)+circle(26,94,1.5,ink)],
      ['capsule','Mini peyk','Mini satellite',360,circle(21,90,10,'#9ca4eb',ink)+path('M17 88h8m-8 4h8M4 86h6v8H4zm28 0h6v8h-6z','none',aqua,3)+path('m20 80 4-7 4 1','none',cream)]
    ],
    border: [
      ['talabaplus','Tələbəplus kartı çərçivəsi','Student Plus card frame',160,ribbonFrame('#62e2b6')+rect(9,10,22,15,4,'#63bc92',cream)+path('M15 17h10m-5-4v8','none',cream)],
      ['fire-frame','Alovlu sessiya çərçivəsi','Exam fire frame',325,ribbonFrame('#ff946b')+path('M9 112q9 3 14-10-1 10 7 14-5 13-16 10zm107 0q-9 3-14-10 1 10-7 14 5 13 16 10z','#ffaa57')],
      ['cyber-neon','Kiber neon kontur','Cyber neon outline',275,ribbonFrame('#9bd9ff')+path('M6 44V24l17-17h21m40 130h21l17-17v-20','none',aqua,4)],
      ['grad-ribbon','Məzun lentli çərçivə','Graduate ribbon frame',400,ribbonFrame(gold)+path('M10 107h40l-6 10 6 9H10l8-9zm68 0h40l-8 10 8 9H78l6-9z','#ae648e')+path('M15 116h24m50 0h24','none',cream)],
      ['pearl-ring','Xəzər mirvarisi çərçivəsi','Caspian pearl frame',500,ribbonFrame('#b4d3e7')+[10,35,60,85,110].flatMap(y=>[circle(7,y+13,2.8,'#f3f0de'),circle(121,y+13,2.8,'#f3f0de')]).join('')+stars(64,9,gold)]
    ],
    pose: [
      ['diploma','Diplomla qələbə','Diploma victory',200,path('M42 104 30 93l-7 5 14 17 21 2','none','#ecc79e',7)+rect(44,98,43,28,5,cream,ink)+path('M51 106h27m-27 6h19','none','#a68a76')+circle(76,117,5,'#b65d6a')],
      ['sip','Qəhvə fasiləsi','Coffee break',110,path('M36 108q8 4 20-12l8-9','none','#efbc94',8)+mug(56,78,'#aa695c')],
      ['coding','Kod yazan tələbə','Coding student',210,path('M34 107l12 12m47-12-13 12','none','#f0bc93',8)+monitor],
      ['wave-hello','Arenaya salam','Arena wave',80,path('M43 100q-20 6-22-22l3-14','none','#f0bd95',9)+path('m14 62 3-8m16 10 3-8','none',gold,2)],
      ['champion','Kubokla rekord','Record trophy pose',450,path('m43 103 15-11m27 11-15-11','none','#f2bd97',8)+path('M53 87h22v10q0 9-11 10-11-1-11-10zm9 20h4v7h9v6H53v-6h9z',gold,ink)+path('M53 92h-8q0 11 10 11m20-11h8q0 11-10 11','none',gold,3)+stars(79,80,cream)]
    ]
  };
})();
