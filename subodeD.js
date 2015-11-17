function odeD()
{
  this.rdy=false;
  this.si;
  this.ss;
  this.ctx;
  this.camCord=[5,5,4];
  this.acord=[0,0]; /*se actualiza solo*/
  this.oangle=0;
  this.viewWidth=0;
  this.viewHeight=0;
  this.fps=0;
  this.renderDistX=10;
  this.renderDistY=10;
  this.startDate=new Date();
  this.uid=-1;
  
  this.texto='';

  this.polis=new Array();
  this.obj2d=new Array();
  this.sprites=new Array();
  
  this.asociarCanvas=function (htmlElem)
  {
    this.ctx=htmlElem.getContext('2d');
    CanvasTextFunctions.enable(this.ctx);
    this.viewWidth=htmlElem.width;
    this.viewHeight=htmlElem.height;
    this.rdy=true;
	this.si=setInterval("mundo.dibujarTodo();mundo.fps++;",15);
	this.ss=setInterval("console.log(mundo.fps);mundo.fps=0;",1000);
  }
  /*Helpers*/
  this.wrap360=function (ang)
  {
    if (ang<0) { ang=360+ang; ang=this.wrap360(ang); }
    if (ang>=360) { ang=ang-360; ang=this.wrap360(ang); }
    
    return ang;
  }
  /*Cámara*/
  this.rotarCam=function (nang)
  {
    this.oangle+=this.wrap360(Math.floor(nang));
  }
  this.moverCam=function (cord)
  {
    this.camCord[0]+=cord[0]; this.camCord[0]=Math.round(this.camCord[0]*10)/10;
    this.camCord[1]+=cord[1]; this.camCord[1]=Math.round(this.camCord[1]*10)/10;
    this.camCord[2]+=cord[2]; this.camCord[2]=Math.round(this.camCord[2]*10)/10;
  }
  this.jumpCam=function (cord)
  {
	this.camCord[0]=cord[0]; this.camCord[0]=Math.round(this.camCord[0]*10)/10;
    this.camCord[1]=cord[1]; this.camCord[1]=Math.round(this.camCord[1]*10)/10;
    this.camCord[2]=cord[2]; this.camCord[2]=Math.round(this.camCord[2]*10)/10;
  }
  this.setacord=function ()
  {
    return [this.camCord[0]+Math.cos(this.oangle/180*Math.PI)*-15,this.camCord[1]+Math.sin(this.oangle/180*Math.PI)*-15];
  }
  this.gang=function (dh)
  {
    return (Math.atan(dh*25/250));
  }
  this.calcCord=function (ccord)
  {
    dh=(this.acord[0]-ccord[0])*Math.sin(this.oangle/180*Math.PI)-(this.acord[1]-ccord[1])*Math.cos(this.oangle/180*Math.PI);
    dv=(this.acord[0]-ccord[0])*Math.cos(this.oangle/180*Math.PI)+(this.acord[1]-ccord[1])*Math.sin(this.oangle/180*Math.PI)
    dz=ccord[2]-this.camCord[2];
    
    ydib=Math.pow(1.05,dv)*800;
    xdib=ydib*Math.tan(this.gang(dh));
    if (dh==0) { dt=Math.abs(ydib*Math.tan(this.gang(0.005))/0.005); } else { dt=Math.abs(xdib/dh); }
    ydib=ydib-dz*dt-350;
    xdib=320+xdib;
    
    return [xdib,ydib];
  }
  /*Constructores*/
  this.crearPoli=function (id,nombre,dots,strkCol,fillCol)
  {
    if (id==0) { id=this.uid; this.uid--; }
    if (strkCol=='') { strkCol='rgba(0,0,0,1)'; }
    if (fillCol=='') { fillCol='rgba(0,255,128,1)'; }
	var n=new odePoli(id,nombre,dots,strkCol,fillCol);
    this.polis.push(n);
  }
  this.destroyPoli=function (po)
  {
	var eid=po.id;
	var mundo=this;
	this.polis.forEach(function (v,i){if(v.id==eid){mundo.polis.splice(i,1)}});
  }
  this.crearObj2d=function (id,nombre,sprite,dir,width,height,cord,opc)
  {
    if (id==0) { id=this.uid; this.uid--; }
    var n=new odeObj2d(id,nombre,sprite,dir,width,height,cord,opc);
	this.obj2d.push(n);
	return n;
  }
  this.destroyObj2d=function (po)
  {
	var eid=po.id;
	var mundo=this;
	this.obj2d.forEach(function (v,i){if(v.id==eid){mundo.obj2d.splice(i,1)}});
  }
  this.crearSprite=function (id,img,dirs,ests,ceilW,ceilH)
  {
    this.sprites[id]=new odeSprite(id,img,dirs,ests,ceilW,ceilH);
  }

  /*Dibujadores*/
  this.ordenaracord=function (objs)
  {
    out=new Array();
    for (rnk=0;rnk<objs.length;rnk++)
    {
      menor=0;
      sudist=-999999999999;
      for (ob=0;ob<objs.length;ob++)
      {
        if (objs[ob]!=undefined)
        {
          esdist=Math.sqrt(Math.pow(this.acord[0]-objs[ob].pos[0],2)+Math.pow(this.acord[1]-objs[ob].pos[1],2))-objs[ob].pos[2]*1000;
          if (esdist>sudist)
          {
            menor=ob;
            sudist=esdist;
          }
        }
      }
      out[out.length]=objs[menor];
      objs[menor]=undefined;
    }
    return out;
  }
  this.dibujarPoli=function (pol)
  {
    this.ctx.beginPath();
    i=0;
    for (qu=0;qu<pol.dots.length;qu++)
    {
      dib=this.calcCord(pol.dots[qu]);
      if (i==0)
      {
        this.ctx.moveTo(dib[0],dib[1]);
      }
      else
      {
        this.ctx.lineTo(dib[0],dib[1]);
        if (i+1>=pol.dots.length)
        {
          dib=this.calcCord(pol.dots[0]);
          this.ctx.lineTo(dib[0],dib[1]);
        }
      }
      i++;
    }
    if (pol.fillCol!='-1') { this.ctx.fillStyle=pol.fillCol; this.ctx.fill(); }
    if (pol.strkCol!='-1') { this.ctx.strokeStyle=pol.strkCol; this.ctx.stroke(); }
  }
  this.dibujarObj2d=function (obj)
  {
    var dib=this.calcCord(obj.pos);
    var dibr=this.calcCord([obj.pos[0],obj.pos[1],obj.pos[2]+1]);
    var rel=dib[1]-dibr[1];
    var dframe=this.sprites[obj.sprite].getFrame(this.wrap360(obj.dir+this.oangle),obj.accion);
    this.ctx.drawImage(this.sprites[obj.sprite].img,dframe[0],dframe[1],dframe[2],dframe[3],dib[0]-rel*obj.width/2,dib[1]-rel*obj.height/1.2,rel*obj.width,rel*obj.height);
	//alert(dib[0]-rel*obj.width/2);
  }
  this.getPolisToDib=function ()
  {
	var mundo=this;
    var out=new Array();
    this.polis.forEach(function(po){
      if ((Math.abs(po.pos[0]-mundo.camCord[0])<=mundo.renderDistX)&&(Math.abs(po.pos[1]-mundo.camCord[1])<=mundo.renderDistY))
      {
        out.push(po);
      }
      else
      {
        //alert(this.polis[po].pos[0]);
      }
    });
    return out;
  }
  this.getObj2dToDib=function ()
  {
	var mundo=this;
    var out=new Array();
    this.obj2d.forEach(function (po) {
	  if ((Math.abs(po.pos[0]-mundo.camCord[0])<=mundo.renderDistX)&&(Math.abs(po.pos[1]-mundo.camCord[1])<=mundo.renderDistY))
      {
        out.push(po);
      }
    });
    return out;
  }
  /******************************************************************************************************/
  this.dibujarTodo=function ()
  {
    if (this.rdy==false) { /*alert("Aún no asociaste un CANVAS!");*/ }
    else
    {
      this.ctx.globalCompositeOperation='source-over';
      this.ctx.clearRect(0,0,this.viewWidth,this.viewHeight);
      this.acord=this.setacord();
        /*polis y objs*/
        var dpolis=this.getPolisToDib();
        var dobjs=this.getObj2dToDib();
        var dtodo=dpolis.concat(dobjs);
        var dtodo=this.ordenaracord(dtodo);
        for (var d=0;d<dtodo.length;d++)
        {
          if (dtodo[d].dots!=undefined)
          {
            this.dibujarPoli(dtodo[d]);
          }
          else if (dtodo[d].sprite!=undefined)
          {
            this.dibujarObj2d(dtodo[d]);
          }
        }
      // this.ctx.drawText("rgba(0,0,0,1);2;",16,this.viewWidth/2,this.viewHeight/2,this.texto);
      // this.ctx.drawText("rgba(255,255,255,1);1;",16,this.viewWidth/2,this.viewHeight/2,this.texto);
      /*clip terrain*/
      // this.ctx.globalCompositeOperation='destination-in';
      // clp=7;
      // tmpClp=new odePoli(0,[[this.camCord[0]-clp,this.camCord[1]-clp,0],[this.camCord[0]+clp,this.camCord[1]-clp,0],[this.camCord[0]+clp,this.camCord[1]+clp,0],[this.camCord[0]-clp,this.camCord[1]+clp,0]],"-1","rgba(255,255,255,1)");
      // this.dibujarPoli(tmpClp);
      /*fondo*/
      // this.ctx.globalCompositeOperation='destination-over';
      // this.ctx.fillStyle="rgba(0,0,0,0.8)";
      // this.ctx.fillRect(0,0,this.viewWidth,this.viewHeight);
    }
  }
  /******************************************************************************************************/
}

function odePoli(id,nombre,dots,strkCol,fillCol)
{
  this.id=id;
  this.nombre=nombre;
  this.dots=dots;
  this.strkCol=strkCol;
  this.fillCol=fillCol;
  this.pos=[0,0,0];
  p=0;
  for (d=0;d<dots.length;d++)
  {
    this.pos[0]+=dots[d][0];
    this.pos[1]+=dots[d][1];
    this.pos[2]+=dots[d][2];
    p++;
  }
  
  if (p>0) { this.pos=[Math.floor(this.pos[0]*10/p)/10,Math.floor(this.pos[1]*10/p)/10,Math.floor(this.pos[2]*10/p)/10]; }
}

function odeObj2d(id,nombre,sprite,dir,width,height,cord,opc)
{
  this.id=id;
  this.nombre=nombre;
  this.sprite=sprite;
  this.width=width;
  this.height=height;
  this.dir=dir;
  this.accion=0;
  this.pos=cord;
  this.hp=0;
  this.mp=0;
  this.adds=new Array();
  if (opc[0]!=undefined) { this.showNombre=opc[0]; } else { this.showNombre=false; }
  if (opc[1]!=undefined) { this.showSombra=opc[1]; } else { this.showSombra=false; }
  if (opc[2]!=undefined) { this.showHP=opc[2]; } else { this.showHP=0; }
  if (opc[3]!=undefined) { this.showMP=opc[3]; } else { this.showMP=0; }
  if (opc[4]!=undefined) { this.showAdds=opc[4]; } else { this.showAdds=0; }
}

function odeSprite(id,img,dirs,ests,ceilW,ceilH)
{
  this.id=id;
  this.img=img;
  this.dirs=dirs;
  this.ests=ests;
  this.ceilW=ceilW;
  this.ceilH=ceilH;
  this.getFrame=function (dirIn,estIn)
  {
    if (this.dirs==4)
    {
            if ((dirIn>=45)&&(dirIn<135)) { rx=0; }
      else if ((dirIn>=135)&&(dirIn<225)) { rx=this.ceilW*1; }
      else if ((dirIn>=225)&&(dirIn<315)) { rx=this.ceilW*2; }
      else { rx=this.ceilW*3; }
    }
    else if (this.dirs==8)
    {
            if ((dirIn>=0)&&(dirIn<45)) { rx=this.ceilW*7; }
      else if ((dirIn>=45)&&(dirIn<90)) { rx=0; }
      else if ((dirIn>=90)&&(dirIn<135)) { rx=this.ceilW*1; }
      else if ((dirIn>=135)&&(dirIn<180)) { rx=this.ceilW*2; }
      else if ((dirIn>=180)&&(dirIn<225)) { rx=this.ceilW*3; }
      else if ((dirIn>=225)&&(dirIn<270)) { rx=this.ceilW*4; }
      else if ((dirIn>=270)&&(dirIn<315)) { rx=this.ceilW*5; }
      else { rx=this.ceilW*6; }
    }
    else 
    {
      rx=0;
    }
    
    if ((estIn>=0)&&(estIn<this.ests))
    {
      ry=estIn*this.ceilH;
    }
    else
    {
      ry=0;
    }
    
    return [rx,ry,this.ceilW,this.ceilH];
  }
}