/*
 * 77B — model units: millimetres.
 * Origin: developer drawing axis 9-5 × 9-L; x right, y down.
 * Image 1 supplies annotated dimensions. The user's later wall reference
 * corrects the east outline; its unlabelled offsets are fitted explicitly.
 * Image 3 is excluded. See geometry-analysis.json for annotation traceability.
 * Wall offsets and unlabelled openings are fitted, not surveyed coordinates.
 */
window.FLOORPLAN77B = (() => {
  const rect = (x0,y0,x1,y1) => [[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const windows = [
    [150,3700,2350,3900],                    // master north / wardrobe window
    [-150,4500,150,6100],[-150,6300,150,8350],// master west, two sections
    [150,8650,2750,8750],                    // master south bay glazing
    [3050,8650,5250,8750],                   // bedroom 2 bay glazing
    [5450,8650,7650,8750],                   // bedroom 1 bay glazing
    [3000,2450,4250,2650],                   // master bathroom north
    [5550,2450,6600,2650],                   // guest bathroom north
    [7500,1100,7750,2250],                   // kitchen west
    [7750,8450,7950,9900],                   // balcony west
    [7950,9900,11150,10000],                 // balcony south
  ];
  const windowHeights = windows.map((_,i) => ({sill:[3,4,5].includes(i)?450:[6,7].includes(i)?1400:[9,10].includes(i)?1050:900,head:2400}));
  return {
    id:'77B-wall-revision-v2',schemaVersion:1,units:'mm',name:'77B',
    origin:'开发商图 9-5 × 9-L 轴线交点；x向右，y向下',
    center:[5550,4950],height:2800,
    bounds:{x:-1450,y:-1450,w:14700,h:13700},
    note:'房间明确标注尺寸仍取第一张开发商图。右侧玄关内凹、餐厅外凸及其转角按用户补充墙体图修正，300偏移与1900/3300/4250转折位置为拟合坐标。轴距与室内净尺寸分开记录；门窗洞口、局部墙厚及3D高度含推定或假定值。阳台1600标线取外缘，不作为净深。本次只修右侧墙体，阳台继续采用开发商图分界；模型面积不代表测绘面积。',
    wallRevision:{
      version:2,scope:'右侧墙体轮廓，保留开发商图阳台分界',reference:'references/layout-reference.png',
      status:'derived',offset:300,
      innerPath:[[11150,150],[11150,1900],[10850,1900],[10850,3300],[11450,3300],[11450,4250],[11150,4250],[11150,10000]],
      note:'内凹、外凸方向及转折关系按补充图；具体偏移和节点坐标由图形比例拟合，非开发商标注。',
    },
    evidence:[
      {label:'横向轴线链',value:'9-5 → 9-15：2900 + 2400 + 2300 + 3500 = 11100；轴距不等于外包尺寸',status:'confirmed'},
      {label:'纵向轴线链',value:'9-L → 9-A：1750 + 900 + 1250 + 600 + 1050 + 2800 + 2600 = 10950；9-M在9-L以北1350',status:'confirmed'},
      {label:'主卧主体',value:'2600 × 3850；北侧衣柜深600，南侧飘窗深300；主体以外有入门扩展区',status:'confirmed'},
      {label:'次卧二（左）',value:'2200 × 2800；衣柜深600，南侧飘窗深300',status:'confirmed'},
      {label:'次卧一（右）',value:'2200 × 2700；衣柜深600，南侧飘窗深300',status:'confirmed'},
      {label:'次卧间隔墙',value:'200',status:'confirmed'},
      {label:'主卫 / 公卫',value:'各 2450 × 1550；按原图南侧开门，主卫连接主卧入门区',status:'confirmed'},
      {label:'过道',value:'局部净深1050',status:'confirmed'},
      {label:'厨房 / 玄关',value:'厨房宽1900，玄关宽1500，合3400；厨房纵深读作2450（小字，建议以原CAD复核）',status:'confirmed'},
      {label:'餐厅局部标注',value:'2875 / 1700；属于局部标注，不用于圈定相通餐客厅的整间面积',status:'confirmed'},
      {label:'客厅',value:'3200 × 2800；竖向2800已旋转放大、交叉复核',status:'confirmed'},
      {label:'阳台原标注',value:'竖向原图标注1600，端点涉及外缘；保留独立门窗分界',status:'confirmed'},
      {label:'阳台模型净深',value:'1450；按1600原标注及拟合边框扣除，不作为开发商净尺寸',status:'derived'},
      {label:'平面墙面与开口坐标',value:'在明确净尺寸和轴线约束下按图拟合；局部偏移不作为开发商逐点数据',status:'derived'},
      {label:'右侧墙体修订 v2',value:'主线x11150；玄关内凹至x10850，餐厅外凸至x11450；转折y1900/3300/4250，均为补充图拟合值',status:'derived'},
      {label:'门宽',value:'入户1000，卧室850–900，卫浴800，厨房移门1550；图中未逐一标宽',status:'assumed'},
      {label:'3D高度',value:'层高2800；门洞2100；窗头2400；普通窗台900，卫浴1400，飘窗450，阳台1050',status:'assumed'},
      {label:'家具、材价与光照',value:'可编辑的示例布置和示例单价；光照为演示，没有真实方位/日期校准',status:'assumed'},
    ],
    walls:[
      // Master envelope. Black segments follow the drawing and stay locked.
      [-150,3700,150,4500,'b'],[-150,6100,150,6300,'b'],[-150,8350,150,8750,'b'],
      [2350,3700,2600,4350,'b'],[2350,2450,2600,3700,'e'],
      [2750,5400,3050,8350,'b'],[2750,8350,3050,8750,'b'],
      // The short master entrance partition has a 900 mm opening.
      [4050,4350,4200,4450,'n'],[4050,5350,4200,5400,'n'],
      // Bathroom north perimeter and shared wall.
      [2350,2450,3000,2650,'e'],[4250,2450,5550,2650,'e'],[6600,2450,7900,2650,'b'],
      [5050,2650,5250,4350,'n'],[7700,2650,7900,4350,'b'],
      // Bathroom south walls, with door gaps.
      [2600,4200,2750,4350,'n'],[3550,4200,5050,4350,'n'],
      [5250,4200,6800,4350,'n'],[7600,4200,7900,4350,'n'],
      // Bedroom 2 north; Bedroom 1 north is offset as in the drawing.
      [2750,5400,4200,5550,'n'],[5050,5400,5250,5550,'n'],
      [5250,5450,5600,5650,'n'],[6450,5450,7950,5650,'n'],
      [5250,5550,5450,8650,'n'],              // 200 mm labelled partition
      [7650,5650,7950,8350,'e'],[7650,8350,7950,8750,'b'],
      // South bay side returns.
      [2750,8350,2850,8750,'e'],[2950,8350,3050,8750,'e'],
      [5250,8350,5450,8750,'n'],
      // Kitchen and northwest services recess.
      [6650,-100,10000,150,'e'],[11000,-100,11350,150,'b'],
      [6650,150,6850,650,'e'],[6850,650,7500,800,'e'],
      [7500,150,7750,1100,'e'],[7500,2250,7750,2650,'e'],
      [7750,2600,9650,2800,'n'],
      [9600,150,9700,850,'n'],[9600,2400,9700,2600,'n'],
      // East outline follows the later user reference: recess, projection, return.
      // Horizontal returns stay outside the matching entry/dining floor polygons.
      [11150,150,11350,2100,'b'],
      [10850,1900,11350,2100,'e'],
      [10850,1900,11050,3300,'e'],
      [10850,3100,11650,3300,'e'],
      [11450,3100,11650,4450,'e'],
      [11150,4250,11650,4450,'e'],
      [11150,4250,11350,5550,'e'],
      [11150,5550,11350,8350,'b'],
      [11150,8350,11350,10000,'b'],
      [7750,8350,7950,8450,'b'],[7750,9900,7950,10000,'e'],
    ],
    windows,windowHeights,
    doors:[
      {name:'入户门',rect:[10000,-100,11000,150],h:[11000,150],c:[-1,0],o:[0,1],len:1000,entry:true},
      {name:'主卧门',rect:[4050,4450,4200,5350],h:[4050,5350],c:[0,-1],o:[-1,0],len:900},
      {name:'主卫门',rect:[2750,4200,3550,4350],h:[2750,4200],c:[1,0],o:[0,-1],len:800},
      {name:'公卫门',rect:[6800,4200,7600,4350],h:[7600,4200],c:[-1,0],o:[0,-1],len:800},
      {name:'次卧二门',rect:[4200,5400,5050,5550],h:[5050,5550],c:[-1,0],o:[0,1],len:850},
      {name:'次卧一门',rect:[5600,5450,6450,5650],h:[5600,5650],c:[1,0],o:[0,1],len:850},
    ],
    slides:[
      {name:'厨房移门',rect:[9600,850,9700,2400],v:true,height:2100},
      {name:'客厅阳台门',rect:[7950,8350,11150,8450],v:false,height:2400},
    ],
    // Openings above the raised bays are deliberately independent of area accounting.
    openings:[
      {rect:[150,8350,2750,8450],height:2400},
      {rect:[3050,8350,5250,8450],height:2400},
      {rect:[5450,8350,7650,8450],height:2400},
    ],
    rooms:[
      {id:'master',name:'主卧',poly:[[150,3900],[2350,3900],[2350,4350],[4050,4350],[4050,5400],[2750,5400],[2750,8350],[150,8350]],mat:'wood',at:[1450,5200],note:'主体标注2600×3850；北侧另有600衣柜区和入门扩展区。模型采用L形轮廓，房间总面积不等于主体矩形面积。'},
      {id:'bed2',name:'次卧二',poly:rect(3050,5550,5250,8350),mat:'wood',at:[4150,6450],note:'图1左侧次卧，净尺寸2200×2800，南侧300飘窗单列。'},
      {id:'bed1',name:'次卧一',poly:rect(5450,5650,7650,8350),mat:'wood',at:[6550,6450],note:'图1右侧次卧，净尺寸2200×2700，南侧300飘窗单列。'},
      {id:'mbath',name:'主卫',poly:rect(2600,2650,5050,4200),mat:'antislip',at:[3825,3500],note:'图1标注2450×1550。墙面轴线偏移与开口位置拟合。'},
      {id:'gbath',name:'公卫',poly:rect(5250,2650,7700,4200),mat:'antislip',at:[6475,3500],note:'图1标注2450×1550。北侧窗宽和窗台高为模型假定。'},
      {id:'hall',name:'过道',poly:[[4200,4350],[7900,4350],[7900,5450],[5450,5450],[5450,5400],[4200,5400]],mat:'tile800',at:[6450,4930],note:'图1局部净深1050；右端接餐客厅，局部墙面错位按图拟合。'},
      {id:'kitchen',name:'厨房',poly:rect(7750,150,9650,2600),mat:'tile600',at:[8650,1750],note:'净宽1900，纵深读作2450，纵深小字建议用原CAD复核；与玄关相通的移门按图拟合。'},
      {id:'entry',name:'玄关',poly:[[9650,150],[11150,150],[11150,1900],[10850,1900],[10850,2800],[9650,2800]],mat:'tile800',at:[10150,2200],note:'图1上段横向1500，厨房加玄关横向标注3400；下部依补充墙体图内凹300（拟合值），地面随墙线收进。'},
      {id:'dining',name:'餐厅',poly:[[7900,2800],[10850,2800],[10850,3300],[11450,3300],[11450,4250],[11150,4250],[11150,5550],[7950,5550],[7950,5450],[7900,5450]],mat:'tile800',at:[9480,4700],note:'餐厅东侧依补充墙体图做内凹、外凸和回收，偏移及转折坐标为按图拟合值。图示2875/1700为局部尺寸，面积按更新多边形计算。'},
      {id:'living',name:'客厅',poly:rect(7950,5550,11150,8350),mat:'tile800',at:[9650,6100],note:'图1客厅标注3200×2800，南侧门窗分隔阳台。'},
      {id:'balcony',name:'阳台',poly:rect(7950,8450,11150,9900),mat:'antislip',at:[9550,9140],note:'图1竖向标注1600涉及外缘。模型地面净深1450为扣除拟合门窗/边界后的推定值，不能当开发商净尺寸。'},
      {id:'bay-master',name:'主卧飘窗',poly:rect(150,8350,2750,8650),mat:'marble',counted:false,elevation:450,note:'南侧300深度来自图1；450高台是3D假定。'},
      {id:'bay-bed2',name:'次卧二飘窗',poly:rect(3050,8350,5250,8650),mat:'marble',counted:false,elevation:450,note:'南侧300深度来自图1；450高台是3D假定。'},
      {id:'bay-bed1',name:'次卧一飘窗',poly:rect(5450,8350,7650,8650),mat:'marble',counted:false,elevation:450,note:'南侧300深度来自图1；450高台是3D假定。'},
      {id:'services',name:'图示设备凹槽',poly:rect(6850,150,7500,650),mat:'tile600',counted:false,elevation:0,note:'厨房西北小凹槽按图示轮廓复原，不并入可用室内面积。'},
    ],
    entry:{arrow:[10500,0],spawn:[10500,650],look:[10300,3500]},
    dimensions:{
      chains:[
        {horizontal:true,at:10900,start:0,segments:[2900,2400,2300,3500]},
        {horizontal:true,at:11450,start:0,segments:[11100]},
        {horizontal:false,at:12250,start:0,segments:[1750,900,1250,600,1050,2800,2600]},
        {horizontal:false,at:12800,start:0,segments:[10950]},
      ],
      net:[
        {a:[150,7900],b:[2750,7900],value:2600},{a:[800,4500],b:[800,8350],value:3850},
        {a:[3050,8000],b:[5250,8000],value:2200},{a:[3250,5550],b:[3250,8350],value:2800},
        {a:[5450,8000],b:[7650,8000],value:2200},{a:[7420,5650],b:[7420,8350],value:2700},
        {a:[2600,2900],b:[5050,2900],value:2450},{a:[5250,2900],b:[7700,2900],value:2450},
        {a:[7750,2500],b:[9650,2500],value:1900},{a:[9650,1550],b:[11150,1550],value:1500},
        {a:[7950,8100],b:[11150,8100],value:3200},{a:[10900,5550],b:[10900,8350],value:2800},
        {a:[11750,8400],b:[11750,10000],value:1600},
      ],
      notes:[
        {x:5550,y:11750,text:'单位 mm；下方及右侧为开发商轴线尺寸（非外包 / 房间净尺寸）'},
        {x:5550,y:12050,text:'面积为模型计算值；未标注门窗洞口及局部墙位按图拟合'},
      ],
    },
    // Illustrative furniture only; dimensions are editable in the designer.
    furniture:[
      ['bed','双人床',1650,6900,1800,2000,270,'#c9d6df'],
      ['wardrobe','衣柜',1250,4200,2200,600,0,'#efe6d8'],
      ['nightstand','床头柜',400,5800,450,400,270,'#e8dccb'],
      ['nightstand','床头柜',400,8000,450,400,270,'#e8dccb'],
      ['bed','双人床',4000,7300,1500,1900,0,'#d8c7dc'],
      ['wardrobe','衣柜',3450,5850,800,600,0,'#efe6d8'],
      ['bed','单人床',6650,7500,1400,1800,90,'#e8d5b5'],
      ['wardrobe','衣柜',7200,5950,900,600,0,'#efe6d8'],
      ['vanity','浴室柜',3100,2900,800,500,0,'#eef1f3'],
      ['toilet','马桶',4000,3000,400,700,0,'#ffffff'],
      ['shower','淋浴房',4600,3425,900,1550,0,'#e4edf2'],
      ['shower','淋浴房',5700,3425,900,1550,0,'#e4edf2'],
      ['toilet','马桶',6400,3000,400,700,0,'#ffffff'],
      ['vanity','浴室柜',7150,2900,800,500,0,'#eef1f3'],
      ['counter','橱柜台面',8050,1375,2450,600,270,'#e9e5de'],
      ['counter','橱柜台面',9000,2300,1300,600,180,'#e9e5de'],
      ['ksink','水槽',8050,1500,700,450,270,'#e1e6ea'],
      ['stove','燃气灶',9000,2300,750,450,180,'#dcdcdc'],
      ['fridge','冰箱',9300,500,650,650,0,'#dfe4e8'],
      ['shoecab','鞋柜',10650,2000,1400,400,90,'#efe6d8'],
      ['table','餐桌',8700,3550,1200,650,90,'#e2cfb4'],
      ['chair','餐椅',8160,3300,400,420,270,'#cfc6b8'],
      ['chair','餐椅',8160,3850,400,420,270,'#cfc6b8'],
      ['chair','餐椅',9250,3300,400,420,90,'#cfc6b8'],
      ['chair','餐椅',9250,3850,400,420,90,'#cfc6b8'],
      ['sofa','双人沙发',8400,7150,1900,850,270,'#b7c4b0'],
      ['coffeetable','茶几',9650,7250,900,500,90,'#e8dccb'],
      ['tvstand','电视柜',10950,7150,1800,400,90,'#e2cfb4'],
      ['washer','洗衣机',10800,9400,600,600,90,'#e6ebee'],
      ['plant','绿植',8250,9550,400,400,0,'#a9c39b'],
    ],
  };
})();
